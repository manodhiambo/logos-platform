'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

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
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    // Only run on client side and when user is authenticated
    if (typeof window === 'undefined' || !isAuthenticated) {
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('⚠️  No auth token found, socket connection skipped');
      return;
    }

    // Socket.IO connects to base URL, NOT /api/v1
    // Remove /api/v1 from the socket URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socketUrl = apiUrl.replace('/api/v1', ''); // Remove API path for socket connection

    console.log('🔌 Initializing socket connection to:', socketUrl);

    // Initialize socket connection
    const socketInstance = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      socketInstance.emit('user:online');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsConnected(false);
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        socketInstance.disconnect();
      }
    });

    socketInstance.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Set up event listeners for real-time features
    socketInstance.on('message:new', (data) => {
      console.log('📨 New message received:', data);
      window.dispatchEvent(new CustomEvent('socket:message:new', { detail: data }));
    });

    socketInstance.on('message:sent', (data) => {
      console.log('📤 Message sent confirmed:', data);
      window.dispatchEvent(new CustomEvent('socket:message:sent', { detail: data }));
    });

    socketInstance.on('user:typing', (data) => {
      console.log('⌨️  User typing:', data);
      window.dispatchEvent(new CustomEvent('socket:user:typing', { detail: data }));
    });

    socketInstance.on('user:status', (data) => {
      console.log('👤 User status changed:', data);
      window.dispatchEvent(new CustomEvent('socket:user:status', { detail: data }));
    });

    socketInstance.on('friend-request:new', (data) => {
      console.log('👥 New friend request:', data);
      window.dispatchEvent(new CustomEvent('socket:friend-request:new', { detail: data }));
    });

    socketInstance.on('friend-request:accepted', (data) => {
      console.log('✅ Friend request accepted:', data);
      window.dispatchEvent(new CustomEvent('socket:friend-request:accepted', { detail: data }));
    });

    socketInstance.on('notification:new', (data) => {
      console.log('🔔 New notification:', data);
      window.dispatchEvent(new CustomEvent('socket:notification:new', { detail: data }));
    });

    socketInstance.on('conversation:updated', (data) => {
      console.log('💬 Conversation updated:', data);
      window.dispatchEvent(new CustomEvent('socket:conversation:updated', { detail: data }));
    });

    socketInstance.on('message:reaction-added', (data) => {
      console.log('👍 Reaction added:', data);
      window.dispatchEvent(new CustomEvent('socket:message:reaction-added', { detail: data }));
    });

    socketInstance.on('message:reaction-removed', (data) => {
      console.log('👎 Reaction removed:', data);
      window.dispatchEvent(new CustomEvent('socket:message:reaction-removed', { detail: data }));
    });

    socketInstance.on('message:deleted', (data) => {
      console.log('🗑️  Message deleted:', data);
      window.dispatchEvent(new CustomEvent('socket:message:deleted', { detail: data }));
    });

    socketInstance.on('messages:read', (data) => {
      console.log('✓✓ Messages read:', data);
      window.dispatchEvent(new CustomEvent('socket:messages:read', { detail: data }));
    });

    // Group events
    socketInstance.on('group:message-new', (data) => {
      console.log('📨 New group message:', data);
      window.dispatchEvent(new CustomEvent('socket:group:message-new', { detail: data }));
    });

    socketInstance.on('group:user-typing', (data) => {
      console.log('⌨️  User typing in group:', data);
      window.dispatchEvent(new CustomEvent('socket:group:user-typing', { detail: data }));
    });

    socketInstance.on('group:member-added', (data) => {
      console.log('➕ Member added to group:', data);
      window.dispatchEvent(new CustomEvent('socket:group:member-added', { detail: data }));
    });

    socketInstance.on('group:member-removed', (data) => {
      console.log('➖ Member removed from group:', data);
      window.dispatchEvent(new CustomEvent('socket:group:member-removed', { detail: data }));
    });

    socketInstance.on('group:updated', (data) => {
      console.log('📝 Group updated:', data);
      window.dispatchEvent(new CustomEvent('socket:group:updated', { detail: data }));
    });

    // Call events (WebRTC)
    socketInstance.on('call:incoming', (data) => {
      console.log('📞 Incoming call:', data);
      window.dispatchEvent(new CustomEvent('socket:call:incoming', { detail: data }));
    });

    socketInstance.on('call:answered', (data) => {
      console.log('📞 Call answered:', data);
      window.dispatchEvent(new CustomEvent('socket:call:answered', { detail: data }));
    });

    socketInstance.on('call:ended', (data) => {
      console.log('📞 Call ended:', data);
      window.dispatchEvent(new CustomEvent('socket:call:ended', { detail: data }));
    });

    socketInstance.on('call:ice-candidate', (data) => {
      console.log('📞 ICE candidate:', data);
      window.dispatchEvent(new CustomEvent('socket:call:ice-candidate', { detail: data }));
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('message:send', { receiverId, content });
    } else {
      console.warn('⚠️  Socket not connected, cannot send message');
    }
  }, [socket, isConnected]);

  const sendGroupMessage = useCallback((groupId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('group:message', { groupId, content });
    } else {
      console.warn('⚠️  Socket not connected, cannot send group message');
    }
  }, [socket, isConnected]);

  const sendTypingIndicator = useCallback((receiverId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit('message:typing', { receiverId, isTyping });
    }
  }, [socket, isConnected]);

  const sendGroupTypingIndicator = useCallback((groupId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit('group:typing', { groupId, isTyping });
    }
  }, [socket, isConnected]);

  const joinGroup = useCallback((groupId: string) => {
    if (socket && isConnected) {
      socket.emit('group:join', { groupId });
    }
  }, [socket, isConnected]);

  const leaveGroup = useCallback((groupId: string) => {
    if (socket && isConnected) {
      socket.emit('group:leave', { groupId });
    }
  }, [socket, isConnected]);

  const reactToMessage = useCallback((messageId: string, reaction: string) => {
    if (socket && isConnected) {
      socket.emit('message:react', { messageId, reaction });
    }
  }, [socket, isConnected]);

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
