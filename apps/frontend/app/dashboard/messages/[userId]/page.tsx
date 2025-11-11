'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import messageService, { Message } from '@/lib/services/message.service';
import { useSocket } from '@/contexts/SocketContext';
import { Send, Phone, Video, Smile } from 'lucide-react';
import { format } from 'date-fns';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function ChatPage({ params }: { params: { userId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { socket, sendTypingIndicator, reactToMessage } = useSocket();
  const { userId: otherUserId } = params;

  useEffect(() => {
    loadMessages();
    messageService.markAsRead(otherUserId);

    // Socket listeners
    if (socket) {
      socket.on('message:new', (message: Message) => {
        if (message.senderId === otherUserId) {
          setMessages((prev) => [...prev, message]);
          messageService.markAsRead(otherUserId);
        }
      });

      socket.on('message:sent', (message: Message) => {
        if (message.receiverId === otherUserId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socket.on('user:typing', (data: { userId: string; isTyping: boolean }) => {
        if (data.userId === otherUserId) {
          setOtherUserTyping(data.isTyping);
        }
      });

      socket.on('message:reaction-added', (data: any) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, reactions: [...(msg.reactions || []), data] }
              : msg
          )
        );
      });

      socket.on('message:reaction-removed', (data: any) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  reactions: (msg.reactions || []).filter(
                    (r: any) => !(r.userId === data.userId && r.reaction === data.reaction)
                  ),
                }
              : msg
          )
        );
      });

      socket.on('message:deleted', (data: { messageId: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, isDeleted: true } : msg
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('message:new');
        socket.off('message:sent');
        socket.off('user:typing');
        socket.off('message:reaction-added');
        socket.off('message:reaction-removed');
        socket.off('message:deleted');
      }
    };
  }, [socket, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages(otherUserId);
      setMessages(response.data);
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
    if (!isTyping) {
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
      sendTypingIndicator(otherUserId, false);
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
      sendTypingIndicator(otherUserId, false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReaction = (messageId: string, reaction: string) => {
    reactToMessage(messageId, reaction);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete message');
    }
  };

  if (loading) {
    return <div className="p-4">Loading messages...</div>;
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-100px)]">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Chat</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Video className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
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
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender.avatarUrl} />
                    <AvatarFallback>
                      {message.sender.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="group relative">
                    {message.isDeleted ? (
                      <div className="rounded-lg px-4 py-2 bg-muted text-muted-foreground italic">
                        This message was deleted
                      </div>
                    ) : (
                      <>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.senderId === otherUserId
                              ? 'bg-muted'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>

                        {/* Reaction overlay */}
                        <div className="absolute -bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg px-2 py-1 flex space-x-1">
                            {EMOJI_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message.id, emoji)}
                                className="hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Show reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex space-x-1 mt-1">
                            {message.reactions.map((r: any, idx: number) => (
                              <span key={idx} className="text-sm">
                                {r.reaction}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <span className="text-xs text-muted-foreground mt-1 block">
                      {format(new Date(message.createdAt), 'HH:mm')}
                      {message.status === 'read' && (
                        <span className="ml-1">✓✓</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <span className="text-muted-foreground">typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
