'use client';

import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation);
    }
  }, [currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await apiClient.get('/ai/conversations?page=1&limit=20');
      setConversations(response.data.data?.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/ai/conversations/${conversationId}/messages?page=1&limit=50`);
      setMessages(response.data.data?.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const createNewConversation = async (firstMessage: string) => {
    try {
      const response = await apiClient.post('/ai/conversations', {
        title: firstMessage.substring(0, 50) || 'New Conversation',
        initialMessage: firstMessage,
      });
      const newConv = response.data.data.conversation;
      setCurrentConversation(newConv.id);
      
      // Add messages from response
      if (response.data.data.firstMessage) {
        setMessages([
          { id: Date.now().toString(), role: 'user', content: firstMessage },
          response.data.data.firstMessage
        ]);
      }
      
      fetchConversations();
      return newConv.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to start conversation. Please try again.');
      return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Optimistically add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    }]);

    try {
      let convId = currentConversation;
      
      if (!convId) {
        convId = await createNewConversation(userMessage);
        if (!convId) {
          setLoading(false);
          return;
        }
      } else {
        const response = await apiClient.post(`/ai/conversations/${convId}/messages`, {
          content: userMessage,
        });
        
        // Add assistant message
        if (response.data.data.assistantMessage) {
          setMessages(prev => [...prev, response.data.data.assistantMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-4">
      {/* Conversations sidebar */}
      <Card className="w-64 p-4 overflow-y-auto hidden md:block">
        <Button
          onClick={() => {
            setCurrentConversation(null);
            setMessages([]);
          }}
          className="w-full mb-4"
        >
          + New Chat
        </Button>
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setCurrentConversation(conv.id)}
              className={`w-full text-left p-3 rounded-lg text-sm transition ${
                currentConversation === conv.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-semibold truncate">{conv.title}</div>
              <div className="text-xs text-gray-500">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">🤖 LOGOS AI Assistant</h2>
          <p className="text-sm text-gray-600">Ask me anything about faith, Bible, or theology</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-4xl mb-4">💬</p>
              <p className="text-lg mb-2">Welcome to LOGOS AI!</p>
              <p className="text-sm">Start a conversation by asking a question about:</p>
              <div className="mt-4 grid grid-cols-2 gap-2 max-w-md mx-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput('What does the Bible say about love?');
                  }}
                >
                  📖 Bible Questions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput('How can I grow in my faith?');
                  }}
                >
                  ✝️ Faith & Growth
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput('What is salvation?');
                  }}
                >
                  🙏 Theology
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput('How should I pray?');
                  }}
                >
                  💭 Prayer
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div
                key={message.id || idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? '...' : 'Send'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
