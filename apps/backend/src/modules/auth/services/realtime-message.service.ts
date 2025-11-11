import { DirectMessage, Conversation, User } from '../../../database/models';
import { MessageStatus } from '../../../database/models/direct-message.model';
import { Op } from 'sequelize';

class RealtimeMessageService {
  // Send message with socket emission
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    attachmentUrl?: string,
    attachmentType?: string
  ) {
    if (senderId === receiverId) {
      throw new Error('You cannot send a message to yourself');
    }

    // Create message
    const message = await DirectMessage.create({
      senderId,
      receiverId,
      content,
      attachmentUrl,
      attachmentType,
      status: MessageStatus.SENT,
    });

    // Load sender info
    const messageWithSender = await DirectMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'fullName', 'avatarUrl'],
        },
      ],
    });

    // Update or create conversation
    await this.updateConversation(senderId, receiverId, message);

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      // Emit to receiver
      io.to(`user:${receiverId}`).emit('message:new', messageWithSender);
      
      // Emit to sender (for multi-device sync)
      io.to(`user:${senderId}`).emit('message:sent', messageWithSender);

      // Update conversation list for both users
      const conversation = await this.getConversationForUser(senderId, receiverId);
      io.to(`user:${senderId}`).emit('conversation:updated', conversation);
      io.to(`user:${receiverId}`).emit('conversation:updated', conversation);
    }

    return messageWithSender;
  }

  // Update conversation
  private async updateConversation(
    senderId: string,
    receiverId: string,
    message: any
  ) {
    const [participant1Id, participant2Id] = [senderId, receiverId].sort();

    let conversation = await Conversation.findOne({
      where: { participant1Id, participant2Id },
    });

    const preview =
      message.content.length > 200
        ? message.content.substring(0, 197) + '...'
        : message.content;

    if (!conversation) {
      conversation = await Conversation.create({
        participant1Id,
        participant2Id,
        lastMessageAt: message.createdAt,
        lastMessagePreview: preview,
        unreadCountUser1: participant1Id === receiverId ? 1 : 0,
        unreadCountUser2: participant2Id === receiverId ? 1 : 0,
      });
    } else {
      const updateData: any = {
        lastMessageAt: message.createdAt,
        lastMessagePreview: preview,
      };

      if (conversation.participant1Id === receiverId) {
        updateData.unreadCountUser1 = conversation.unreadCountUser1 + 1;
      } else {
        updateData.unreadCountUser2 = conversation.unreadCountUser2 + 1;
      }

      await conversation.update(updateData);
    }

    return conversation;
  }

  // Get conversation for socket emission
  private async getConversationForUser(userId: string, otherUserId: string) {
    const [participant1Id, participant2Id] = [userId, otherUserId].sort();

    const conversation = await Conversation.findOne({
      where: { participant1Id, participant2Id },
      include: [
        {
          model: User,
          as: 'participant1',
          attributes: ['id', 'fullName', 'avatarUrl', 'email'],
        },
        {
          model: User,
          as: 'participant2',
          attributes: ['id', 'fullName', 'avatarUrl', 'email'],
        },
      ],
    });

    if (!conversation) return null;

    // Get the other user based on conversation associations
    const otherUser = (conversation as any).participant1?.id === userId
      ? (conversation as any).participant2
      : (conversation as any).participant1;
      
    const unreadCount =
      conversation.participant1Id === userId
        ? conversation.unreadCountUser1
        : conversation.unreadCountUser2;

    return {
      conversationId: conversation.id,
      otherUser,
      lastMessagePreview: conversation.lastMessagePreview,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount,
    };
  }

  // Mark messages as read with socket
  async markMessagesAsRead(receiverId: string, senderId: string) {
    const unreadMessages = await DirectMessage.findAll({
      where: {
        senderId,
        receiverId,
        status: { [Op.ne]: MessageStatus.READ },
      },
    });

    if (unreadMessages.length > 0) {
      await DirectMessage.update(
        {
          status: MessageStatus.READ,
          readAt: new Date(),
        },
        {
          where: {
            senderId,
            receiverId,
            status: { [Op.ne]: MessageStatus.READ },
          },
        }
      );

      // Reset unread count
      const [participant1Id, participant2Id] = [receiverId, senderId].sort();
      const conversation = await Conversation.findOne({
        where: { participant1Id, participant2Id },
      });

      if (conversation) {
        if (conversation.participant1Id === receiverId) {
          await conversation.update({ unreadCountUser1: 0 });
        } else {
          await conversation.update({ unreadCountUser2: 0 });
        }
      }

      // Emit socket event to sender
      const io = (global as any).io;
      if (io) {
        io.to(`user:${senderId}`).emit('messages:read', {
          receiverId,
          messageIds: unreadMessages.map((m) => m.id),
        });
      }
    }
  }

  // Typing indicator
  async sendTypingIndicator(userId: string, receiverId: string, isTyping: boolean) {
    const io = (global as any).io;
    if (io) {
      io.to(`user:${receiverId}`).emit('user:typing', {
        userId,
        isTyping,
      });
    }
  }
}

export default new RealtimeMessageService();
