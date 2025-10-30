import Community from '../models/Community.model';
import CommunityMember from '../models/CommunityMember.model';
import User from '../../../database/models/user.model';
import { Op } from 'sequelize';

class CommunityService {
  /**
   * Create a new community
   */
  async createCommunity(data: any, userId: string) {
    const community = await Community.create({
      name: data.name,
      description: data.description,
      category: data.category,
      privacyLevel: data.privacyLevel || 'public',
      avatarUrl: data.avatarUrl,
      coverImageUrl: data.coverImageUrl,
      createdBy: userId,
      memberCount: 1,
    });

    // Add creator as admin member
    await CommunityMember.create({
      communityId: community.id,
      userId: userId,
      role: 'owner',
    });

    return community;
  }

  /**
   * Get all communities with pagination and filters
   */
  async getCommunities(filters: any, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const where: any = { isActive: true };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    if (filters.privacyLevel) {
      where.privacyLevel = filters.privacyLevel;
    } else {
      // Default: only show public communities for non-members
      where.privacyLevel = 'public';
    }

    const { rows: communities, count: total } = await Community.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      communities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCommunities: total,
        limit,
      },
    };
  }

  /**
   * Get community by ID
   */
  async getCommunityById(communityId: string, userId?: string) {
    const community = await Community.findByPk(communityId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    });

    if (!community) {
      throw new Error('Community not found');
    }

    // Check if user is a member
    let userMembership: CommunityMember | null = null;
    if (userId) {
      userMembership = await CommunityMember.findOne({
        where: { communityId, userId },
      });
    }

    return {
      community,
      isJoined: !!userMembership,
      userRole: userMembership ? userMembership.role : null,
    };
  }

  /**
   * Update community
   */
  async updateCommunity(communityId: string, data: any, userId: string) {
    const community = await Community.findByPk(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    // Check if user is admin
    const membership = await CommunityMember.findOne({
      where: { communityId, userId, role: 'owner' },
    });

    if (!membership) {
      throw new Error('Unauthorized: Only admins can update the community');
    }

    await community.update({
      name: data.name || community.name,
      description: data.description || community.description,
      category: data.category || community.category,
      privacyLevel: data.privacyLevel || community.privacyLevel,
      avatarUrl: data.avatarUrl || community.avatarUrl,
      coverImageUrl: data.coverImageUrl || community.coverImageUrl,
    });

    return community;
  }

  /**
   * Delete community
   */
  async deleteCommunity(communityId: string, userId: string) {
    const community = await Community.findByPk(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    // Check if user is admin
    const membership = await CommunityMember.findOne({
      where: { communityId, userId, role: 'owner' },
    });

    if (!membership) {
      throw new Error('Unauthorized: Only admins can delete the community');
    }

    await community.update({ isActive: false });

    return { message: 'Community deleted successfully' };
  }

  /**
   * Join community
   */
  async joinCommunity(communityId: string, userId: string) {
    const community = await Community.findByPk(communityId);

    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isActive) {
      throw new Error('This community is no longer active');
    }

    // Check if already a member
    const existingMember = await CommunityMember.findOne({
      where: { communityId, userId },
    });

    if (existingMember) {
      throw new Error('Already a member of this community');
    }

    // Check privacy level
    if (community.privacyLevel === 'invite_only') {
      throw new Error('This community is invite-only');
    }

    // Add member
    const membership = await CommunityMember.create({
      communityId,
      userId,
      role: 'member',
    });

    // Update member count
    await community.increment('memberCount', { by: 1 });

    return membership;
  }

  /**
   * Leave community
   */
  async leaveCommunity(communityId: string, userId: string) {
    const membership = await CommunityMember.findOne({
      where: { communityId, userId },
    });

    if (!membership) {
      throw new Error('Not a member of this community');
    }

    // Check if user is the only admin
    if (membership.role === 'owner') {
      const adminCount = await CommunityMember.count({
        where: { communityId, role: 'owner' },
      });

      if (adminCount === 1) {
        throw new Error(
          'Cannot leave: You are the only admin. Please assign another admin first.'
        );
      }
    }

    await membership.destroy();

    // Update member count
    const community = await Community.findByPk(communityId);
    if (community) {
      await community.decrement('memberCount', { by: 1 });
    }

    return { message: 'Successfully left the community' };
  }

  /**
   * Get community members
   */
  async getCommunityMembers(communityId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { rows: members, count: total } = await CommunityMember.findAndCountAll({
      where: { communityId },
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'avatarUrl', 'bio'],
        },
      ],
      order: [['joinedAt', 'ASC']],
    });

    return {
      members,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMembers: total,
        limit,
      },
    };
  }

  /**
   * Update member role (admin only)
   */
  async updateMemberRole(
    communityId: string,
    memberId: string,
    newRole: 'owner' | 'moderator' | 'member',
    requesterId: string
  ) {
    // Check if requester is admin
    const requesterMembership = await CommunityMember.findOne({
      where: { communityId, userId: requesterId, role: 'owner' },
    });

    if (!requesterMembership) {
      throw new Error('Unauthorized: Only admins can change member roles');
    }

    // Find target member
    const targetMembership = await CommunityMember.findOne({
      where: { communityId, userId: memberId },
    });

    if (!targetMembership) {
      throw new Error('Member not found in this community');
    }

    // If demoting an admin, check if there will be at least one admin left
    if (targetMembership.role === 'owner' && newRole !== 'owner') {
      const adminCount = await CommunityMember.count({
        where: { communityId, role: 'owner' },
      });

      if (adminCount === 1) {
        throw new Error('Cannot demote the only admin');
      }
    }

    await targetMembership.update({ role: newRole });

    return targetMembership;
  }

  /**
   * Get user's communities
   */
  async getUserCommunities(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: memberships, count: total } = await CommunityMember.findAndCountAll({
      where: { userId },
      limit,
      offset,
      include: [
        {
          model: Community,
          as: 'community',
          where: { isActive: true },
        },
      ],
      order: [['joinedAt', 'DESC']],
    });

    const communities = memberships.map((m: any) => ({
      ...(m.community ? m.community.toJSON() : {}),
      userRole: m.role,
      joinedAt: m.joinedAt,
    }));

    return {
      communities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCommunities: total,
        limit,
      },
    };
  }
}

export default new CommunityService();
