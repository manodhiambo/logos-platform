import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../shared/utils/logger.util';

export const setupGroupSocket = (io: SocketIOServer) => {
  io.on('connection', (socket: any) => {
    const userId = socket.userId;

    // Join group room
    socket.on('group:join', async (data: { groupId: string }) => {
      try {
        const GroupMember = (await import('../database/models/group-member.model')).default;
        
        // Verify membership
        const member = await GroupMember.findOne({
          where: {
            groupId: data.groupId,
            userId,
          },
        });

        if (!member) {
          return socket.emit('error', { message: 'Not a member of this group' });
        }

        socket.join(`group:${data.groupId}`);
        
        // Notify other members
        socket.to(`group:${data.groupId}`).emit('group:user-joined', {
          userId,
          groupId: data.groupId,
        });

        logger.info(`User ${userId} joined group ${data.groupId}`);
      } catch (error) {
        logger.error('Error joining group:', error);
        socket.emit('error', { message: 'Failed to join group' });
      }
    });

    // Leave group room
    socket.on('group:leave', (data: { groupId: string }) => {
      socket.leave(`group:${data.groupId}`);
      socket.to(`group:${data.groupId}`).emit('group:user-left', {
        userId,
        groupId: data.groupId,
      });
    });

    // Send group message
    socket.on('group:message', async (data: { groupId: string; content: string; attachmentUrl?: string; attachmentType?: string }) => {
      try {
        const GroupMessage = (await import('../database/models/group-message.model')).default;
        const User = (await import('../database/models/user.model')).default;
        
        const message = await GroupMessage.create({
          groupId: data.groupId,
          senderId: userId,
          content: data.content,
          attachmentUrl: data.attachmentUrl,
          attachmentType: data.attachmentType,
        });

        // Load sender info
        const messageWithSender = await GroupMessage.findByPk(message.id, {
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'fullName', 'avatarUrl'],
            },
          ],
        });

        // Emit to all group members
        io.to(`group:${data.groupId}`).emit('group:message-new', messageWithSender);
      } catch (error) {
        logger.error('Error sending group message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Group typing indicator
    socket.on('group:typing', (data: { groupId: string; isTyping: boolean }) => {
      socket.to(`group:${data.groupId}`).emit('group:user-typing', {
        userId,
        isTyping: data.isTyping,
      });
    });
  });
};
