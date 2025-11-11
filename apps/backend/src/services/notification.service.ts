import { Notification } from '../database/models';
import { logger } from '../shared/utils/logger.util';

export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPTED = 'friend_accepted',
  NEW_MESSAGE = 'new_message',
  NEW_FOLLOWER = 'new_follower',
  GROUP_INVITATION = 'group_invitation',
  PRAYER_REQUEST = 'prayer_request',
  COMMUNITY_INVITATION = 'community_invitation',
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  VIDEO_CALL = 'video_call',
}

class NotificationService {
  // Create notification
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
    actionUrl?: string;
  }) {
    try {
      const notification = await Notification.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        actionUrl: data.actionUrl,
        isRead: false,
      });

      // Emit socket event
      const io = (global as any).io;
      if (io) {
        io.to(`user:${data.userId}`).emit('notification:new', notification);
      }

      // Here you can integrate with push notification services
      // await this.sendPushNotification(data.userId, notification);

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send push notification (integrate with FCM, OneSignal, etc.)
  async sendPushNotification(userId: string, notification: any) {
    // TODO: Integrate with Firebase Cloud Messaging or OneSignal
    // Example:
    // const fcmToken = await this.getUserFCMToken(userId);
    // if (fcmToken) {
    //   await admin.messaging().send({
    //     token: fcmToken,
    //     notification: {
    //       title: notification.title,
    //       body: notification.message,
    //     },
    //     data: {
    //       type: notification.type,
    //       relatedId: notification.relatedId,
    //     },
    //   });
    // }
    
    logger.info(`Push notification would be sent to user ${userId}`);
  }

  // Notify friend request
  async notifyFriendRequest(senderId: string, receiverId: string, senderName: string) {
    return this.createNotification({
      userId: receiverId,
      type: NotificationType.FRIEND_REQUEST,
      title: 'New Friend Request',
      message: `${senderName} sent you a friend request`,
      relatedId: senderId,
      relatedType: 'user',
      actionUrl: '/dashboard/friends/requests',
    });
  }

  // Notify friend accepted
  async notifyFriendAccepted(accepterId: string, requesterId: string, accepterName: string) {
    return this.createNotification({
      userId: requesterId,
      type: NotificationType.FRIEND_ACCEPTED,
      title: 'Friend Request Accepted',
      message: `${accepterName} accepted your friend request`,
      relatedId: accepterId,
      relatedType: 'user',
      actionUrl: `/dashboard/profile/${accepterId}`,
    });
  }

  // Notify new message
  async notifyNewMessage(senderId: string, receiverId: string, senderName: string, preview: string) {
    return this.createNotification({
      userId: receiverId,
      type: NotificationType.NEW_MESSAGE,
      title: `New message from ${senderName}`,
      message: preview.length > 50 ? preview.substring(0, 47) + '...' : preview,
      relatedId: senderId,
      relatedType: 'message',
      actionUrl: `/dashboard/messages/${senderId}`,
    });
  }

  // Notify new follower
  async notifyNewFollower(followerId: string, followedId: string, followerName: string) {
    return this.createNotification({
      userId: followedId,
      type: NotificationType.NEW_FOLLOWER,
      title: 'New Follower',
      message: `${followerName} started following you`,
      relatedId: followerId,
      relatedType: 'user',
      actionUrl: `/dashboard/profile/${followerId}`,
    });
  }

  // Notify group invitation
  async notifyGroupInvitation(inviterId: string, invitedId: string, groupId: string, groupName: string) {
    return this.createNotification({
      userId: invitedId,
      type: NotificationType.GROUP_INVITATION,
      title: 'Group Invitation',
      message: `You've been invited to join ${groupName}`,
      relatedId: groupId,
      relatedType: 'group',
      actionUrl: `/dashboard/groups/${groupId}`,
    });
  }

  // Notify video call
  async notifyVideoCall(callerId: string, receiverId: string, callerName: string) {
    return this.createNotification({
      userId: receiverId,
      type: NotificationType.VIDEO_CALL,
      title: 'Incoming Call',
      message: `${callerName} is calling you`,
      relatedId: callerId,
      relatedType: 'call',
      actionUrl: '/dashboard/calls',
    });
  }
}

export default new NotificationService();
