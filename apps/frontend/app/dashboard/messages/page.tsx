'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import messageService, { Conversation } from '@/lib/services/message.service';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

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

  if (loading) {
    return <div className="p-4">Loading conversations...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Messages</span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No conversations yet. Start chatting with your friends!
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.conversationId}
                  onClick={() => handleConversationClick(conv.otherUser.id)}
                  className="flex items-center space-x-4 p-3 hover:bg-accent rounded-lg cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage src={conv.otherUser.avatarUrl} />
                    <AvatarFallback>
                      {conv.otherUser.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold truncate">
                        {conv.otherUser.fullName}
                      </p>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessagePreview || 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
