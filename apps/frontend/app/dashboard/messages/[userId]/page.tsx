'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import messageService, { Message } from '@/lib/services/message.service';
import { Send } from 'lucide-react';
import { format } from 'date-fns';

export default function ChatPage({ params }: { params: { userId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userId: otherUserId } = params;

  useEffect(() => {
    loadMessages();
    // Mark messages as read
    messageService.markAsRead(otherUserId);
  }, [otherUserId]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await messageService.sendMessage(otherUserId, newMessage);
      setNewMessage('');
      await loadMessages();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading messages...</div>;
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-100px)]">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
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
                    message.senderId === otherUserId ? '' : 'flex-row-reverse space-x-reverse'
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender.avatarUrl} />
                    <AvatarFallback>
                      {message.sender.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.senderId === otherUserId
                          ? 'bg-muted'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
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
