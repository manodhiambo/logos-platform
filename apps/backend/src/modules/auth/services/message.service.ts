import { DirectMessage, Conversation, User } from '../../../database/models';
import { MessageStatus } from '../../../database/models/direct-message.model';
import { Op } from 'sequelize';

class MessageService {
  // Send a message
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

    // Create or get conversation
    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    // Create message
    const message = await DirectMessage.create({
      senderId,
      receiverId,
      content,
      attachmentUrl,
      attachmentType,
      status: MessageStatus.SENT,
    });

    // Update conversation
    await this.updateConversation(conversation, message, senderId);

    return message;
  }

  // Get or create conversation
  private async getOrCreateConversation(user1Id: string, user2Id: string) {
    // Ensure consistent ordering
    const [participant1Id, participant2Id] = [user1Id, user2Id].sort();

    let conversation = await Conversation.findOne({
      where: {
        participant1Id,
        participant2Id,
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participant1Id,
        participant2Id,
      });
    }

    return conversation;
  }

  // Update conversation with latest message
  private async updateConversation(
    conversation: any,
    message: any,
    senderId: string
  ) {
    const preview =
      message.content.length > 200
        ? message.content.substring(0, 197) + '...'
        : message.content;

    const updateData: any = {
      lastMessageAt: message.createdAt,
      lastMessagePreview: preview,
    };

    // Increment unread count for receiver
    if (conversation.participant1Id === senderId) {
      updateData.unreadCountUser2 = conversation.unreadCountUser2 + 1;
    } else {
      updateData.unreadCountUser1 = conversation.unreadCountUser1 + 1;
    }

    await conversation.update(updateData);
  }

  // Get messages between two users
  async getMessages(
    userId: string,
    otherUserId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const offset = (page - 1) * limit;

    const { rows: messages, count: total } = await DirectMessage.findAndCountAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        isDeleted: false,
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
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

    // Mark messages as read
    await this.markMessagesAsRead(userId, otherUserId);

    return {
      messages: messages.reverse(), // Oldest first
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Mark messages as read
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

      // Reset unread count in conversation
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
    }
  }

  // Get all conversations
  async getConversations(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const { rows: conversations, count: total } = await Conversation.findAndCountAll({
      where: {
        [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      limit,
      offset,
      order: [['lastMessageAt', 'DESC']],
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

    // Format conversations to show the other user
    const formattedConversations = conversations.map((conv: any) => {
      const otherUser =
        conv.participant1Id === userId ? conv.participant2 : conv.participant1;
      const unreadCount =
        conv.participant1Id === userId
          ? conv.unreadCountUser1
          : conv.unreadCountUser2;

      return {
        conversationId: conv.id,
        otherUser,
        lastMessagePreview: conv.lastMessagePreview,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
      };
    });

    return {
      conversations: formattedConversations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Delete message
  async deleteMessage(messageId: string, userId: string) {
    const message = await DirectMessage.findByPk(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new Error('You can only delete your own messages');
    }

    await message.update({
      isDeleted: true,
      deletedBy: userId,
    });
  }

  // Get unread message count
  async getUnreadCount(userId: string) {
    const count = await DirectMessage.count({
      where: {
        receiverId: userId,
        status: { [Op.ne]: MessageStatus.READ },
        isDeleted: false,
      },
    });

    return count;
  }
}

export default new MessageService();
