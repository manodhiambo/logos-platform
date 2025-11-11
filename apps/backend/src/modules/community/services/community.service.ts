import { Community, CommunityMember, User, Post } from '../../../database/models';
import { MemberRole } from '../../../database/models/community-member.model';
import { Op } from 'sequelize';

class CommunityService {
  async createCommunity(userId: string, data: any) {
    try {
      const community = await Community.create({
        name: data.name,
        description: data.description,
        category: data.category,
        privacyLevel: data.privacyLevel || 'public',
        avatarUrl: data.avatarUrl,
        coverImageUrl: data.coverImageUrl,
        createdBy: userId,
        memberCount: 1,
        isActive: true,
      });

      // Add creator as admin member
      await CommunityMember.create({
        communityId: community.id,
        userId: userId,
        role: MemberRole.ADMIN,
      });

      return community;
    } catch (error: any) {
      throw new Error(`Failed to create community: ${error.message}`);
    }
  }

  async getCommunities(filters: any, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const where: any = { isActive: true };

    if (filters.category) where.category = filters.category;
    if (filters.privacyLevel) where.privacyLevel = filters.privacyLevel;
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
    const community = await Community.findOne({
      where: { id: communityId, isActive: true },
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

    // Check if user is a member
    let isMember = false;
    let userRole = null;
    if (userId) {
      const membership = await CommunityMember.findOne({
        where: { communityId, userId },
      });
      isMember = !!membership;
      userRole = membership?.role || null;
    }

    return {
      ...community.toJSON(),
      isMember,
      userRole,
    };
  }

  async joinCommunity(communityId: string, userId: string) {
    const community = await Community.findByPk(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isActive) {
      throw new Error('This community is not active');
    }

    // Check if already a member
    const existingMember = await CommunityMember.findOne({
      where: { communityId, userId },
    });

    if (existingMember) {
      throw new Error('You are already a member of this community');
    }

    // Check privacy level
    if (community.privacyLevel === 'private' || community.privacyLevel === 'invite_only') {
      throw new Error('This community requires an invitation to join');
    }

    // Add member
    const member = await CommunityMember.create({
      communityId,
      userId,
      role: MemberRole.MEMBER,
    });

    // Increment member count
    await community.increment('memberCount');

    return member;
  }

  async leaveCommunity(communityId: string, userId: string) {
    const community = await Community.findByPk(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    // Check if user is the creator
    if (community.createdBy === userId) {
      throw new Error('Community creator cannot leave. Please transfer ownership or delete the community.');
    }

    const member = await CommunityMember.findOne({
      where: { communityId, userId },
    });

    if (!member) {
      throw new Error('You are not a member of this community');
    }

    await member.destroy();
    await community.decrement('memberCount');
  }

  async getCommunityMembers(communityId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { rows: members, count: total } = await CommunityMember.findAndCountAll({
      where: { communityId },
      limit,
      offset,
      order: [['joinedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'avatarUrl', 'bio'],
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

  async updateCommunity(communityId: string, userId: string, data: any) {
    const community = await Community.findByPk(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    // Check if user is admin or creator
    const member = await CommunityMember.findOne({
      where: { communityId, userId },
    });

    if (!member || (member.role !== MemberRole.ADMIN && community.createdBy !== userId)) {
      throw new Error('You do not have permission to update this community');
    }

    await community.update(data);
    return community;
  }

  async deleteCommunity(communityId: string, userId: string) {
    const community = await Community.findByPk(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    if (community.createdBy !== userId) {
      throw new Error('Only the creator can delete this community');
    }

    // Soft delete - mark as inactive
    await community.update({ isActive: false });
  }

  async getMyCommunities(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: memberships, count: total } = await CommunityMember.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['joinedAt', 'DESC']],
      include: [
        {
          model: Community,
          as: 'community',
          where: { isActive: true },
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
      joinedAt: m.joinedAt,
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
