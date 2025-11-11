'use client';

import { useState, useEffect } from 'react';
import messageService from '@/lib/services/message.service';
import { useRouter } from 'next/navigation';

interface Conversation {
  conversationId: string;
  otherUser: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    email: string;
  };
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleConversationClick = (userId: string) => {
    router.push(`/dashboard/messages/${userId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Messages</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
        
        <div className="divide-y">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No conversations yet. Start chatting with your friends!
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversationId}
                onClick={() => handleConversationClick(conv.otherUser.id)}
                className="flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Avatar */}
                <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  {conv.otherUser.avatarUrl ? (
                    <img
                      src={conv.otherUser.avatarUrl}
                      alt={conv.otherUser.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-600">
                      {conv.otherUser.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {conv.otherUser.fullName}
                    </p>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatDate(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessagePreview || 'No messages yet'}
                  </p>
                </div>
                
                {/* Unread Badge */}
                {conv.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
