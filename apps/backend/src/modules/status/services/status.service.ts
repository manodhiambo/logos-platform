import { Op } from 'sequelize';
import Status from '../../../database/models/status.model';
import User from '../../../database/models/user.model';

class StatusService {
  async createStatus(userId: string, data: {
    content?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    backgroundColor?: string;
    textColor?: string;
  }) {
    if (!data.content && !data.mediaUrl) {
      throw new Error('Status must have either text content or media');
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const status = await Status.create({
      userId,
      content: data.content,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      backgroundColor: data.backgroundColor || '#667eea',
      textColor: data.textColor || '#ffffff',
      viewsCount: 0,
      expiresAt,
      isActive: true,
    });

    return this.getStatusById(status.id);
  }

  async getStatusById(statusId: string) {
    const status = await Status.findOne({
      where: { id: statusId, isActive: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
    });

    if (!status) {
      throw new Error('Status not found');
    }

    return status;
  }

  // Get active (non-expired) statuses for feed - from all users
  async getFeedStatuses(currentUserId: string, page = 1, limit = 30) {
    const offset = (page - 1) * limit;
    const now = new Date();

    const { rows: statuses, count: total } = await Status.findAndCountAll({
      where: {
        isActive: true,
        expiresAt: { [Op.gt]: now },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      statuses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get statuses grouped by user (for the story ring UI)
  async getStatusesByUser(page = 1, limit = 20) {
    const now = new Date();

    const statuses = await Status.findAll({
      where: {
        isActive: true,
        expiresAt: { [Op.gt]: now },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Group by user
    const userMap = new Map<string, { user: any; statuses: any[] }>();
    statuses.forEach((s: any) => {
      const uid = s.user?.id;
      if (!uid) return;
      if (!userMap.has(uid)) {
        userMap.set(uid, { user: s.user, statuses: [] });
      }
      userMap.get(uid)!.statuses.push(s);
    });

    return Array.from(userMap.values());
  }

  async getUserStatuses(userId: string) {
    const now = new Date();

    const statuses = await Status.findAll({
      where: {
        userId,
        isActive: true,
        expiresAt: { [Op.gt]: now },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'avatarUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return statuses;
  }

  async viewStatus(statusId: string, viewerId: string) {
    const status = await Status.findOne({
      where: { id: statusId, isActive: true },
    });

    if (!status) {
      throw new Error('Status not found or expired');
    }

    // Increment view count (only if viewer is not the author)
    if (status.userId !== viewerId) {
      await status.increment('viewsCount');
    }

    return status;
  }

  async deleteStatus(statusId: string, userId: string) {
    const status = await Status.findOne({
      where: { id: statusId, userId },
    });

    if (!status) {
      throw new Error('Status not found or unauthorized');
    }

    await status.update({ isActive: false });
  }

  // Cleanup expired statuses (can be called via cron or on-demand)
  async cleanupExpiredStatuses() {
    const now = new Date();
    const count = await Status.update(
      { isActive: false },
      {
        where: {
          expiresAt: { [Op.lt]: now },
          isActive: true,
        },
      }
    );
    return count[0]; // number of affected rows
  }
}

export default new StatusService();
