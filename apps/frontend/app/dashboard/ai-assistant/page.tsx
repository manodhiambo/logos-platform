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
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const response = await apiClient.get('/ai/conversations?page=1&limit=50');
      setConversations(response.data.data?.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/ai/conversations/${conversationId}/messages?page=1&limit=100`);
      setMessages(response.data.data?.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg: Message = { id: `temp_${Date.now()}`, role: 'user', content: text };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      if (!currentConversation) {
        // Create new conversation (also sends first message internally)
        const response = await apiClient.post('/ai/conversations', {
          title: text.substring(0, 50),
          initialMessage: text,
        });

        const data = response.data.data;
        const convId = data.conversation?.id;
        setCurrentConversation(convId);

        // Replace temp message with real messages from API
        const userMsg = data.messages?.userMessage;
        const assistantMsg = data.messages?.assistantMessage;

        setMessages([
          userMsg || tempUserMsg,
          ...(assistantMsg ? [assistantMsg] : []),
        ]);

        await fetchConversations();
      } else {
        // Send to existing conversation
        const response = await apiClient.post(`/ai/conversations/${currentConversation}/messages`, {
          content: text,
        });

        const data = response.data.data;
        const userMsg = data.userMessage;
        const assistantMsg = data.assistantMessage;

        setMessages(prev => {
          // Replace temp optimistic message with real messages
          const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
          return [
            ...withoutTemp,
            ...(userMsg ? [userMsg] : [tempUserMsg]),
            ...(assistantMsg ? [assistantMsg] : []),
          ];
        });
      }
    } catch (err: any) {
      console.error('Send message failed:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      // Remove the temp user message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      setInput(text); // Restore input
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    { label: '📖 Bible Questions', text: 'What does the Bible say about love?' },
    { label: '✝️ Faith & Growth', text: 'How can I grow stronger in my faith?' },
    { label: '🙏 Theology', text: 'What is salvation and how do I receive it?' },
    { label: '💭 Prayer', text: 'How should I pray according to the Bible?' },
    { label: '📚 Scriptures', text: 'What are the most important Bible verses I should know?' },
    { label: '❤️ Relationships', text: 'What does God say about marriage and relationships?' },
  ];

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-4">
      {/* Conversations sidebar */}
      <Card className="w-64 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-3 border-b">
          <Button onClick={startNewChat} className="w-full" size="sm">
            + New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-gray-400 text-center pt-4">No conversations yet</p>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setCurrentConversation(conv.id);
                setError(null);
              }}
              className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors ${
                currentConversation === conv.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="truncate font-medium text-sm">{conv.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              🤖 LOGOS AI Assistant
            </h2>
            <p className="text-xs text-gray-500">Biblical guidance powered by AI</p>
          </div>
          <Button variant="outline" size="sm" onClick={startNewChat} className="md:hidden">
            + New
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center mt-4">
              <p className="text-4xl mb-3">🙏</p>
              <p className="text-lg font-semibold text-gray-700 mb-1">Welcome to LOGOS AI</p>
              <p className="text-sm text-gray-500 mb-6">
                Ask me anything about the Bible, faith, theology, or Christian living
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => setInput(prompt.text)}
                    className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm text-gray-700"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div
                key={message.id || idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mr-2 mt-1">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.createdAt && (
                    <p className={`text-xs mt-1 opacity-60`}>
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mr-2 mt-1">
                AI
              </div>
              <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the Bible, faith, theology..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4"
            >
              {loading ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
              ) : (
                'Send'
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            LOGOS AI provides biblical guidance — always consult your pastor for major decisions
          </p>
        </div>
      </Card>
    </div>
  );
}
