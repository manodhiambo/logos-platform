import { Community, CommunityMember, User } from '../../../database/models';
import { MemberRole } from '../../../database/models/community-member.model';
import { Op } from 'sequelize';

class CommunityService {
  async createCommunity(data: any, userId: string) {
    const community = await Community.create({
      name: data.name,
      description: data.description,
      category: data.category,
      privacyLevel: data.privacyLevel || 'public',
      avatarUrl: data.avatarUrl,
      createdBy: userId,
      memberCount: 1,
    });

    await CommunityMember.create({
      communityId: community.id,
      userId: userId,
      role: MemberRole.ADMIN,
    });

    return this.getCommunityById(community.id, userId);
  }

  async getCommunities(filters: any, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const { rows: communities, count: total } = await Community.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });

    return {
      communities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCommunityById(communityId: string, userId?: string) {
    const community = await Community.findByPk(communityId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });

    if (!community) {
      throw new Error('Community not found');
    }

    let membership = null;
    if (userId) {
      membership = await CommunityMember.findOne({
        where: {
          communityId,
          userId,
        },
      });
    }

    return {
      community,
      membership,
      isMember: !!membership,
      role: membership?.role || null,
    };
  }

  async updateCommunity(communityId: string, data: any, userId: string) {
    const community = await Community.findByPk(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    const membership = await CommunityMember.findOne({
      where: {
        communityId,
        userId,
        role: { [Op.in]: [MemberRole.ADMIN, MemberRole.MODERATOR] },
      },
    });

    if (!membership && community.createdBy !== userId) {
      throw new Error('You do not have permission to update this community');
    }

    const allowedUpdates = ['name', 'description', 'category', 'avatarUrl', 'privacyLevel'];
    const updates: any = {};

    allowedUpdates.forEach(field => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });

    await community.update(updates);
    return community;
  }

  async deleteCommunity(communityId: string, userId: string) {
    const community = await Community.findOne({
      where: { id: communityId, createdBy: userId },
    });

    if (!community) {
      throw new Error('Community not found or you do not have permission to delete it');
    }

    await CommunityMember.destroy({ where: { communityId } });
    await community.destroy();

    return { message: 'Community deleted successfully' };
  }

  async joinCommunity(communityId: string, userId: string) {
    const community = await Community.findByPk(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    const existingMembership = await CommunityMember.findOne({
      where: { communityId, userId },
    });

    if (existingMembership) {
      throw new Error('You are already a member of this community');
    }

    const membership = await CommunityMember.create({
      communityId,
      userId,
      role: MemberRole.MEMBER,
    });

    await community.increment('memberCount');

    return membership;
  }

  async leaveCommunity(communityId: string, userId: string) {
    const membership = await CommunityMember.findOne({
      where: { communityId, userId },
    });

    if (!membership) {
      throw new Error('You are not a member of this community');
    }

    const community = await Community.findByPk(communityId);
    if (community?.createdBy === userId) {
      throw new Error('Community creator cannot leave. Please transfer ownership or delete the community.');
    }

    await membership.destroy();
    await community?.decrement('memberCount');

    return { message: 'Successfully left the community' };
  }

  async getCommunityMembers(communityId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { rows: members, count: total } = await CommunityMember.findAndCountAll({
      where: { communityId },
      limit,
      offset,
      order: [
        ['role', 'ASC'],
        ['createdAt', 'ASC']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'avatarUrl', 'role'],
        },
      ],
    });

    return {
      members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateMemberRole(communityId: string, memberId: string, role: string, requesterId: string) {
    const requesterMembership = await CommunityMember.findOne({
      where: {
        communityId,
        userId: requesterId,
        role: { [Op.in]: [MemberRole.ADMIN, MemberRole.MODERATOR] },
      },
    });

    const community = await Community.findByPk(communityId);

    if (!requesterMembership && community?.createdBy !== requesterId) {
      throw new Error('You do not have permission to update member roles');
    }

    const membership = await CommunityMember.findOne({
      where: { communityId, userId: memberId },
    });

    if (!membership) {
      throw new Error('Member not found');
    }

    await membership.update({ role: role as MemberRole });
    return membership;
  }

  async getUserCommunities(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: memberships, count: total } = await CommunityMember.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Community,
          as: 'community',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'fullName', 'avatarUrl'],
            },
          ],
        },
      ],
    });

    const communities = memberships.map((m: any) => ({
      ...m.community.toJSON(),
      userRole: m.role,
      joinedAt: m.createdAt,
    }));

    return {
      communities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new CommunityService();
