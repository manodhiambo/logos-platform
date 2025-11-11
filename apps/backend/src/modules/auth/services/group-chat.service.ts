import { GroupChat, GroupMember, GroupMessage, User } from '../../../database/models';
import { GroupMemberRole } from '../../../database/models/group-member.model';
import { Op } from 'sequelize';
import NotificationService from '../../../services/notification.service';

class GroupChatService {
  // Create group chat
  async createGroup(userId: string, data: { name: string; description?: string; avatarUrl?: string }) {
    try {
      const group = await GroupChat.create({
        name: data.name,
        description: data.description,
        avatarUrl: data.avatarUrl,
        createdBy: userId,
        isActive: true,
      });

      // Add creator as admin
      await GroupMember.create({
        groupId: group.id,
        userId: userId,
        role: GroupMemberRole.ADMIN,
      });

      return group;
    } catch (error: any) {
      throw new Error(`Failed to create group: ${error.message}`);
    }
  }

  // Get user's groups
  async getUserGroups(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: memberships, count: total } = await GroupMember.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['joinedAt', 'DESC']],
      include: [
        {
          model: GroupChat,
          as: 'group',
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

    const groups = memberships.map((m: any) => ({
      ...m.group.toJSON(),
      userRole: m.role,
      joinedAt: m.joinedAt,
    }));

    return {
      groups,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get group by ID
  async getGroupById(groupId: string, userId?: string) {
    const group = await GroupChat.findOne({
      where: { id: groupId, isActive: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Check if user is a member
    let isMember = false;
    let userRole = null;
    if (userId) {
      const membership = await GroupMember.findOne({
        where: { groupId, userId },
      });
      isMember = !!membership;
      userRole = membership?.role || null;
    }

    return {
      ...group.toJSON(),
      isMember,
      userRole,
    };
  }

  // Add member to group
  async addMember(groupId: string, userId: string, inviterId: string) {
    const group = await GroupChat.findByPk(groupId);

    if (!group || !group.isActive) {
      throw new Error('Group not found');
    }

    // Check if inviter is admin
    const inviterMembership = await GroupMember.findOne({
      where: { groupId, userId: inviterId },
    });

    if (!inviterMembership || inviterMembership.role !== GroupMemberRole.ADMIN) {
      throw new Error('Only admins can add members');
    }

    // Check if already a member
    const existingMember = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (existingMember) {
      throw new Error('User is already a member');
    }

    const member = await GroupMember.create({
      groupId,
      userId,
      role: GroupMemberRole.MEMBER,
    });

    // Notify user
    await NotificationService.notifyGroupInvitation(
      inviterId,
      userId,
      groupId,
      group.name
    );

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.to(`group:${groupId}`).emit('group:member-added', {
        groupId,
        member: await this.getMemberWithUser(member.id),
      });
    }

    return member;
  }

  // Remove member from group
  async removeMember(groupId: string, userId: string, removerId: string) {
    const group = await GroupChat.findByPk(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    // Check if remover is admin or removing self
    if (removerId !== userId) {
      const removerMembership = await GroupMember.findOne({
        where: { groupId, userId: removerId },
      });

      if (!removerMembership || removerMembership.role !== GroupMemberRole.ADMIN) {
        throw new Error('Only admins can remove members');
      }
    }

    // Cannot remove creator
    if (group.createdBy === userId) {
      throw new Error('Cannot remove group creator');
    }

    const member = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!member) {
      throw new Error('User is not a member');
    }

    await member.destroy();

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.to(`group:${groupId}`).emit('group:member-removed', {
        groupId,
        userId,
      });
    }
  }

  // Get group members
  async getGroupMembers(groupId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const { rows: members, count: total } = await GroupMember.findAndCountAll({
      where: { groupId },
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

  // Get group messages
  async getGroupMessages(groupId: string, userId: string, page: number = 1, limit: number = 50) {
    // Verify membership
    const member = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!member) {
      throw new Error('You are not a member of this group');
    }

    const offset = (page - 1) * limit;

    const { rows: messages, count: total } = await GroupMessage.findAndCountAll({
      where: { groupId, isDeleted: false },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });

    return {
      messages: messages.reverse(),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update group
  async updateGroup(groupId: string, userId: string, data: any) {
    const group = await GroupChat.findByPk(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    // Check if user is admin
    const member = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!member || member.role !== GroupMemberRole.ADMIN) {
      throw new Error('Only admins can update the group');
    }

    await group.update(data);

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.to(`group:${groupId}`).emit('group:updated', group);
    }

    return group;
  }

  // Delete group
  async deleteGroup(groupId: string, userId: string) {
    const group = await GroupChat.findByPk(groupId);

    if (!group) {
      throw new Error('Group not found');
    }

    if (group.createdBy !== userId) {
      throw new Error('Only the creator can delete the group');
    }

    await group.update({ isActive: false });

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.to(`group:${groupId}`).emit('group:deleted', { groupId });
    }
  }

  // Helper to get member with user info
  private async getMemberWithUser(memberId: string) {
    return await GroupMember.findByPk(memberId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });
  }
}

export default new GroupChatService();
