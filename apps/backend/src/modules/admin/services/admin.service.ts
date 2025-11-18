import User, { UserRole, UserStatus } from '../../../database/models/user.model';
import Community from '../../../database/models/community.model';
import PrayerRequest from '../../../database/models/prayer-request.model';
import Post from '../../../database/models/post.model';
import Announcement, { AnnouncementStatus } from '../../../database/models/announcement.model';
import { AppError } from '../../../shared/middlewares/error-handler.middleware';
import { emailService } from '../../../shared/utils/email.util';
import { Op } from 'sequelize';
import { sequelize } from '../../../config/database.config';

class AdminService {
  // Get all users with filters and pagination
  async getAllUsers(filters: {
    page: number;
    limit: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    sortBy: string;
    sortOrder: string;
  }) {
    const { page, limit, role, status, search, sortBy, sortOrder } = filters;
    const offset = (page - 1) * limit;

    const where: any = { isDeleted: false };

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy || 'createdAt', sortOrder || 'DESC']],
      attributes: { exclude: ['password'] },
    });

    return {
      users,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  // Get user by ID
  async getUserById(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Create user manually
  async createUser(userData: any) {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: userData.email }, { username: userData.username }],
      },
    });

    if (existingUser) {
      throw new AppError('User with this email or username already exists', 400);
    }

    const user = await User.create({
      ...userData,
      emailVerified: true,
      status: UserStatus.ACTIVE,
    });

    return user;
  }

  // Update user role
  async updateUserRole(adminId: string, userId: string, newRole: UserRole) {
    const admin = await User.findByPk(adminId);
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Only super admins can assign admin or super_admin roles
    if ((newRole === UserRole.ADMIN || newRole === UserRole.SUPER_ADMIN) && admin?.role !== UserRole.SUPER_ADMIN) {
      throw new AppError('Only super admins can assign admin roles', 403);
    }

    await user.update({ role: newRole });

    return user;
  }

  // Update user status
  async updateUserStatus(userId: string, status: UserStatus, reason?: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.update({ status });

    if (status === UserStatus.SUSPENDED && reason) {
      await emailService.sendEmail({
        to: user.email,
        subject: 'Account Suspended',
        html: `
          <p>Your account has been suspended.</p>
          <p><strong>Reason:</strong> ${reason}</p>
        `,
      });
    }

    return user;
  }

  // Delete user
  async deleteUser(adminId: string, userId: string, deleteType: 'soft' | 'hard' = 'soft', reason?: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError('Cannot delete a super admin', 403);
    }

    if (deleteType === 'hard') {
      await user.destroy();
      return { message: 'User permanently deleted' };
    } else {
      await user.update({ isDeleted: true, status: UserStatus.SUSPENDED });
      return { message: 'User soft deleted' };
    }
  }

  // Get system statistics
  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      totalCommunities,
      totalPrayers,
      totalPosts,
      newUsersToday,
    ] = await Promise.all([
      User.count({ where: { isDeleted: false } }),
      User.count({ where: { status: UserStatus.ACTIVE, isDeleted: false } }),
      Community.count({ where: { isActive: true } }),
      PrayerRequest.count(),
      Post.count(),
      User.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsersToday: activeUsers,
      totalCommunities,
      totalPrayers,
      totalPosts,
      pendingModeration: 0,
      newUsersToday,
      generatedAt: new Date(),
    };
  }

  // Create announcement
  async createAnnouncement(adminId: string, announcementData: any) {
    const announcement = await Announcement.create({
      ...announcementData,
      authorId: adminId,
      publishedAt: announcementData.status === 'published' ? new Date() : null,
    });

    // If published and global, send notifications to all users
    if (announcement.status === AnnouncementStatus.PUBLISHED && announcement.isGlobal) {
      await this.notifyAllUsers(announcement);
    }

    return announcement;
  }

  // Update announcement
  async updateAnnouncement(announcementId: string, updateData: any) {
    const announcement = await Announcement.findByPk(announcementId);

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    // If changing to published, set publishedAt
    if (updateData.status === 'published' && announcement.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    await announcement.update(updateData);

    // If newly published and global, send notifications
    if (
      updateData.status === 'published' &&
      announcement.status !== 'published' &&
      announcement.isGlobal
    ) {
      await this.notifyAllUsers(announcement);
    }

    return announcement;
  }

  // Delete announcement
  async deleteAnnouncement(announcementId: string) {
    const announcement = await Announcement.findByPk(announcementId);

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    await announcement.destroy();
    return { message: 'Announcement deleted successfully' };
  }

  // Get all announcements
  async getAllAnnouncements(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { count, rows: announcements } = await Announcement.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName'],
        },
      ],
    });

    return {
      announcements,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  // Notify all users about announcement
  private async notifyAllUsers(announcement: Announcement) {
    const users = await User.findAll({
      where: {
        isDeleted: false,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
      limit: 1000, // Safety limit
    });

    // Create in-app notifications for all users
    await Promise.all(
      users.slice(0, 100).map(user =>
        Notification.create({
          userId: user.id,
          type: 'announcement',
          title: announcement.title,
          message: announcement.content.substring(0, 200),
          isRead: false,
          metadata: {
            announcementId: announcement.id,
            announcementType: announcement.type,
            priority: announcement.priority,
          },
        }).catch(err => console.error(`Failed to create notification for user ${user.id}:`, err))
      )
    );

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 50;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await Promise.all(
        batch.map(user =>
          emailService.sendEmail({
            to: user.email,
            subject: `📢 ${announcement.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #667eea; color: white; padding: 30px; text-align: center;">
                  <h1>📢 New Announcement</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2>${announcement.title}</h2>
                  <p>${announcement.content}</p>
                  <p style="margin-top: 30px; font-size: 14px; color: #666;">
                    This is a ${announcement.type} announcement from the LOGOS team.
                  </p>
                </div>
              </div>
            `,
          })
        )
      );
    }
  }
}

export default new AdminService();
