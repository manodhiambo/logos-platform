import { Server as SocketIOServer } from 'socket.io';
import RealtimeMessageService from '../modules/auth/services/realtime-message.service';
import { logger } from '../shared/utils/logger.util';

export const setupMessageSocket = (io: SocketIOServer) => {
  io.on('connection', (socket: any) => {
    const userId = socket.userId;

    // Handle typing indicator
    socket.on('message:typing', async (data: { receiverId: string; isTyping: boolean }) => {
      try {
        await RealtimeMessageService.sendTypingIndicator(
          userId,
          data.receiverId,
          data.isTyping
        );
      } catch (error) {
        logger.error('Error handling typing indicator:', error);
      }
    });

    // Handle message reactions
    socket.on('message:react', async (data: { messageId: string; reaction: string }) => {
      try {
        const MessageReaction = (await import('../database/models/message-reaction.model')).default;
        
        // Toggle reaction
        const existing = await MessageReaction.findOne({
          where: {
            messageId: data.messageId,
            userId,
            reaction: data.reaction,
          },
        });

        if (existing) {
          await existing.destroy();
          socket.emit('message:reaction-removed', {
            messageId: data.messageId,
            reaction: data.reaction,
            userId,
          });
        } else {
          const reaction = await MessageReaction.create({
            messageId: data.messageId,
            userId,
            reaction: data.reaction,
          });
          
          // Emit to all participants
          const DirectMessage = (await import('../database/models/direct-message.model')).default;
          const message = await DirectMessage.findByPk(data.messageId);
          
          if (message) {
            io.to(`user:${message.senderId}`).emit('message:reaction-added', {
              messageId: data.messageId,
              reaction: data.reaction,
              userId,
            });
            io.to(`user:${message.receiverId}`).emit('message:reaction-added', {
              messageId: data.messageId,
              reaction: data.reaction,
              userId,
            });
          }
        }
      } catch (error) {
        logger.error('Error handling message reaction:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle message deletion
    socket.on('message:delete', async (data: { messageId: string }) => {
      try {
        const DirectMessage = (await import('../database/models/direct-message.model')).default;
        const message = await DirectMessage.findByPk(data.messageId);

        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        if (message.senderId !== userId && message.receiverId !== userId) {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        await message.update({ isDeleted: true, deletedBy: userId });

        // Emit to both users
        io.to(`user:${message.senderId}`).emit('message:deleted', {
          messageId: data.messageId,
        });
        io.to(`user:${message.receiverId}`).emit('message:deleted', {
          messageId: data.messageId,
        });
      } catch (error) {
        logger.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle call signals (for WebRTC)
    socket.on('call:initiate', (data: { receiverId: string; offer: any }) => {
      io.to(`user:${data.receiverId}`).emit('call:incoming', {
        callerId: userId,
        offer: data.offer,
      });
    });

    socket.on('call:answer', (data: { callerId: string; answer: any }) => {
      io.to(`user:${data.callerId}`).emit('call:answered', {
        answer: data.answer,
      });
    });

    socket.on('call:ice-candidate', (data: { userId: string; candidate: any }) => {
      io.to(`user:${data.userId}`).emit('call:ice-candidate', {
        candidate: data.candidate,
      });
    });

    socket.on('call:end', (data: { userId: string }) => {
      io.to(`user:${data.userId}`).emit('call:ended');
    });
  });
};
