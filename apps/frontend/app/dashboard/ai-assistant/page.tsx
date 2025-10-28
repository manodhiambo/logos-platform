'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aiAssistantService, AIConversation, AIMessage } from '@/lib/services/ai-assistant.service';

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await aiAssistantService.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      setLoading(true);
      const data = await aiAssistantService.getConversation(conversationId);
      setCurrentConversation(data.conversation);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      setLoading(true);
      const data = await aiAssistantService.createConversation();
      setCurrentConversation(data.conversation);
      setMessages([]);
      await loadConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');

    try {
      setSending(true);

      // If no conversation, create one first
      if (!currentConversation) {
        const data = await aiAssistantService.createConversation(messageContent);
        setCurrentConversation(data.conversation);
        setMessages(data.messages || []);
        await loadConversations();
      } else {
        // Add user message immediately
        const userMessage: AIMessage = {
          id: 'temp-' + Date.now(),
          role: 'user',
          content: messageContent,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Send message and get response
        const data = await aiAssistantService.sendMessage(
          currentConversation.id,
          messageContent
        );
        
        // Replace temp message with real messages
        setMessages(data.messages || []);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await aiAssistantService.deleteConversation(conversationId);
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      await loadConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* Sidebar - Conversation List */}
        <aside className="w-80 bg-white rounded-lg border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold mb-3">Conversations</h2>
            <Button onClick={createNewConversation} className="w-full" disabled={loading}>
              ✨ New Conversation
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading && conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No conversations yet. Start a new one!
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    currentConversation?.id === conv.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.title}</p>
                      <p className={`text-xs mt-1 ${
                        currentConversation?.id === conv.id ? 'text-white/80' : 'text-slate-500'
                      }`}>
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className={`text-xl hover:scale-110 transition-transform ${
                        currentConversation?.id === conv.id ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              AI Spiritual Assistant
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ask me anything about faith, scripture, or spiritual guidance
            </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!currentConversation ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Welcome to AI Spiritual Assistant
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Start a conversation to receive spiritual guidance, explore scripture, or ask
                    questions about your faith journey.
                  </p>
                  <Button onClick={createNewConversation}>Start Conversation</Button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                Start typing to begin the conversation...
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">
                        {message.role === 'user' ? '👤' : '🤖'}
                      </span>
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-white/70' : 'text-slate-500'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-lg p-4 bg-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce delay-100">●</span>
                      <span className="animate-bounce delay-200">●</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !inputMessage.trim()}>
                {sending ? '⏳' : '📤'} Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
