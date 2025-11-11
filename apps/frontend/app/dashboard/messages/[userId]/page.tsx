'use client';

import { useState, useEffect, useRef } from 'react';
import messageService from '@/lib/services/message.service';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  isDeleted: boolean;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  receiver: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export default function ChatPage() {
  const params = useParams();
  const otherUserId = params.userId as string;
  
  const router = useRouter();
  const { isConnected, sendTypingIndicator } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!otherUserId) return;
    
    loadMessages();

    // Listen for socket events
    const handleNewMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail;
      if (message.senderId === otherUserId) {
        setMessages((prev) => [...prev, message]);
        messageService.markAsRead(otherUserId);
      }
    };

    const handleMessageSent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail;
      if (message.receiverId === otherUserId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleUserTyping = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;
      if (data.userId === otherUserId) {
        setOtherUserTyping(data.isTyping);
      }
    };

    const handleMessagesRead = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg.id) ? { ...msg, status: 'read' as const } : msg
        )
      );
    };

    window.addEventListener('socket:message:new', handleNewMessage);
    window.addEventListener('socket:message:sent', handleMessageSent);
    window.addEventListener('socket:user:typing', handleUserTyping);
    window.addEventListener('socket:messages:read', handleMessagesRead);

    return () => {
      window.removeEventListener('socket:message:new', handleNewMessage);
      window.removeEventListener('socket:message:sent', handleMessageSent);
      window.removeEventListener('socket:user:typing', handleUserTyping);
      window.removeEventListener('socket:messages:read', handleMessagesRead);
    };
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages(otherUserId);
      setMessages(response.data);
      await messageService.markAsRead(otherUserId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    if (!isTyping && isConnected) {
      setIsTyping(true);
      sendTypingIndicator(otherUserId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (isConnected) {
        sendTypingIndicator(otherUserId, false);
      }
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await messageService.sendMessage(otherUserId, newMessage);
      setNewMessage('');
      setIsTyping(false);
      if (isConnected) {
        sendTypingIndicator(otherUserId, false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Chat</h1>
            {isConnected ? (
              <span className="text-xs text-green-500">● Connected</span>
            ) : (
              <span className="text-xs text-gray-400">○ Connecting...</span>
            )}
          </div>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === otherUserId ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-[70%] ${
                    message.senderId === otherUserId
                      ? ''
                      : 'flex-row-reverse space-x-reverse'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    {message.sender.avatarUrl ? (
                      <img
                        src={message.sender.avatarUrl}
                        alt={message.sender.fullName}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {message.sender.fullName.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    {message.isDeleted ? (
                      <div className="rounded-lg px-4 py-2 bg-gray-200 text-gray-500 italic">
                        This message was deleted
                      </div>
                    ) : (
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.senderId === otherUserId
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                      </div>
                    )}
                    <span className="text-xs text-gray-500 mt-1 block px-1">
                      {formatTime(message.createdAt)}
                      {message.status === 'read' && message.senderId !== otherUserId && (
                        <span className="ml-1">✓✓</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg px-4 py-2">
                <span className="text-gray-600">typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 shadow-lg">
        <form 
          onSubmit={handleSendMessage} 
          className="flex space-x-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
