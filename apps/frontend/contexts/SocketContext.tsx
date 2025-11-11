'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (receiverId: string, content: string) => void;
  sendGroupMessage: (groupId: string, content: string) => void;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void;
  sendGroupTypingIndicator: (groupId: string, isTyping: boolean) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  reactToMessage: (messageId: string, reaction: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get token from localStorage or your auth context
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No auth token found, socket connection skipped');
      return;
    }

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
      socketInstance.emit('user:online');
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    if (socket) {
      socket.emit('message:send', { receiverId, content });
    }
  }, [socket]);

  const sendGroupMessage = useCallback((groupId: string, content: string) => {
    if (socket) {
      socket.emit('group:message', { groupId, content });
    }
  }, [socket]);

  const sendTypingIndicator = useCallback((receiverId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('message:typing', { receiverId, isTyping });
    }
  }, [socket]);

  const sendGroupTypingIndicator = useCallback((groupId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('group:typing', { groupId, isTyping });
    }
  }, [socket]);

  const joinGroup = useCallback((groupId: string) => {
    if (socket) {
      socket.emit('group:join', { groupId });
    }
  }, [socket]);

  const leaveGroup = useCallback((groupId: string) => {
    if (socket) {
      socket.emit('group:leave', { groupId });
    }
  }, [socket]);

  const reactToMessage = useCallback((messageId: string, reaction: string) => {
    if (socket) {
      socket.emit('message:react', { messageId, reaction });
    }
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage,
        sendGroupMessage,
        sendTypingIndicator,
        sendGroupTypingIndicator,
        joinGroup,
        leaveGroup,
        reactToMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
