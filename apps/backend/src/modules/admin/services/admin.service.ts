import User, { UserRole, UserStatus } from '../../../database/models/user.model';
import Announcement, { AnnouncementStatus } from '../../../database/models/announcement.model';
import { AppError } from '../../../shared/middlewares/error-handler.middleware';
import emailService from '../../../shared/utils/email.util';
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
    includeDeleted: boolean;
  }) {
    const { page, limit, role, status, search, sortBy, sortOrder, includeDeleted } = filters;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (!includeDeleted) where.isDeleted = false;

    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { exclude: ['passwordHash', 'emailVerificationToken', 'passwordResetToken'] },
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
      attributes: { exclude: ['passwordHash', 'emailVerificationToken', 'passwordResetToken'] },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Update user role
  async updateUserRole(adminId: string, userId: string, newRole: UserRole) {
    const admin = await User.findByPk(adminId);
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent demoting or modifying super admins unless you are super admin
    if (user.role === UserRole.SUPER_ADMIN && !admin?.isSuperAdmin()) {
      throw new AppError('Only super admins can modify super admin accounts', 403);
    }

    // Prevent regular admins from creating super admins
    if (newRole === UserRole.SUPER_ADMIN && !admin?.isSuperAdmin()) {
      throw new AppError('Only super admins can create super admin accounts', 403);
    }

    user.role = newRole;
    await user.save();

    return user;
  }

  // Update user status (suspend, ban, activate)
  async updateUserStatus(userId: string, newStatus: UserStatus, reason?: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Cannot suspend/ban super admins
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError('Cannot modify super admin status', 403);
    }

    user.status = newStatus;
    await user.save();

    // Log the action (you can create an audit log table later)
    // await AuditLog.create({ action: 'STATUS_CHANGE', userId, newStatus, reason });

    return user;
  }

  // Delete user (soft or hard delete)
  async deleteUser(adminId: string, userId: string, deleteType: 'soft' | 'hard', reason: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Cannot delete super admins
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError('Cannot delete super admin accounts', 403);
    }

    if (deleteType === 'soft') {
      // Soft delete
      user.isDeleted = true;
      user.deletedAt = new Date();
      user.deletedBy = adminId;
      await user.save();

      // Send notification email
      await emailService.sendEmail({
        to: user.email,
        subject: 'Your LOGOS Account Has Been Deleted',
        html: `
          <h2>Account Deleted</h2>
          <p>Hello ${user.username},</p>
          <p>Your LOGOS account has been deleted by an administrator.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>If you believe this was done in error, please contact support.</p>
        `,
      });
    } else {
      // Hard delete - Delete all user content first
      // TODO: Delete all posts, comments, prayers, etc.
      await user.destroy();
    }

    return { message: `User ${deleteType} deleted successfully` };
  }

  // Create user manually
  async createUser(userData: any) {
    // Check if email exists
    const existingEmail = await User.findOne({ where: { email: userData.email } });
    if (existingEmail) {
      throw new AppError('Email already exists', 400);
    }

    // Check if username exists
    const existingUsername = await User.findOne({ where: { username: userData.username } });
    if (existingUsername) {
      throw new AppError('Username already exists', 400);
    }

    const user = await User.create({
      ...userData,
      passwordHash: userData.password,
    });

    return user;
  }

  // Get system statistics
  async getSystemStats(period: string = 'month') {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
    }

    const [totalUsers, activeUsers, newUsers, suspendedUsers, bannedUsers] = await Promise.all([
      User.count({ where: { isDeleted: false } }),
      User.count({ where: { status: UserStatus.ACTIVE, isDeleted: false } }),
      User.count({ where: { createdAt: { [Op.gte]: startDate }, isDeleted: false } }),
      User.count({ where: { status: UserStatus.SUSPENDED, isDeleted: false } }),
      User.count({ where: { status: UserStatus.BANNED, isDeleted: false } }),
    ]);

    const usersByRole = await User.findAll({
      where: { isDeleted: false },
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role'],
      raw: true,
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        suspended: suspendedUsers,
        banned: bannedUsers,
        byRole: usersByRole,
      },
      period,
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
          as: 'author',
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
        'notificationSettings.announcements': true,
      },
    });

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

export const adminService = new AdminService();
