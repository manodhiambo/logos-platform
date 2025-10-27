import Notification from '../models/Notification.model';
import NotificationPreferences from '../models/NotificationPreferences.model';
import User from '../../../database/models/user.model';
import { logger } from '../../../shared/utils/logger.util';

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    linkUrl?: string;
    metadata?: any;
  }) {
    try {
      const notification = await Notification.create({
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        linkUrl: data.linkUrl,
        metadata: data.metadata || {},
        isRead: false,
      });

      logger.info(`Notification created for user ${data.userId}: ${data.title}`);

      return notification;
    } catch (error: any) {
      logger.error('Error creating notification:', error.message);
      throw error;
    }
  }

  /**
   * Get user's notifications
   */
  async getNotifications(userId: string, page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
    const offset = (page - 1) * limit;
    const where: any = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    const { rows: notifications, count: total } = await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        limit,
      },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (!notification.isRead) {
      await notification.update({ isRead: true });
    }

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false,
        },
      }
    );

    return { message: 'All notifications marked as read' };
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.destroy();

    return { message: 'Notification deleted successfully' };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    const count = await Notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId: string) {
    let preferences = await NotificationPreferences.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await NotificationPreferences.create({
        userId,
        emailNotifications: true,
        pushNotifications: true,
        prayerReminders: true,
        devotionalReminders: true,
        commentNotifications: true,
        mentionNotifications: true,
        communityNotifications: true,
      });
    }

    return preferences;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, data: any) {
    let preferences = await NotificationPreferences.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create with provided data
      preferences = await NotificationPreferences.create({
        userId,
        ...data,
      });
    } else {
      // Update existing preferences
      await preferences.update(data);
    }

    return preferences;
  }

  /**
   * Helper: Notify user about new comment
   */
  async notifyNewComment(postAuthorId: string, commenterName: string, postId: string, postTitle: string) {
    await this.createNotification({
      userId: postAuthorId,
      type: 'comment',
      title: 'New Comment',
      message: `${commenterName} commented on your post: "${postTitle}"`,
      linkUrl: `/posts/${postId}`,
      metadata: { postId },
    });
  }

  /**
   * Helper: Notify user about prayer support
   */
  async notifyPrayerSupport(requestOwnerId: string, supporterName: string, requestId: string, requestTitle: string) {
    await this.createNotification({
      userId: requestOwnerId,
      type: 'prayer_support',
      title: 'Someone Prayed for You',
      message: `${supporterName} prayed for your request: "${requestTitle}"`,
      linkUrl: `/prayers/requests/${requestId}`,
      metadata: { requestId },
    });
  }

  /**
   * Helper: Notify about community invite
   */
  async notifyCommunityInvite(userId: string, inviterName: string, communityId: string, communityName: string) {
    await this.createNotification({
      userId,
      type: 'community_invite',
      title: 'Community Invitation',
      message: `${inviterName} invited you to join "${communityName}"`,
      linkUrl: `/communities/${communityId}`,
      metadata: { communityId },
    });
  }

  /**
   * Helper: Daily devotional reminder
   */
  async notifyDevotionalReminder(userId: string) {
    await this.createNotification({
      userId,
      type: 'devotional_reminder',
      title: 'Daily Devotional',
      message: "Today's devotional is ready! Take a moment to grow in faith.",
      linkUrl: '/devotionals/today',
    });
  }
}

export default new NotificationService();
