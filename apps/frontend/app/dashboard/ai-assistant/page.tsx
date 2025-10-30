'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let convId = conversationId;
      
      if (!convId) {
        const convResponse = await apiClient.post('/ai/conversations', {
          title: input.substring(0, 50),
          initialMessage: input,
        });
        convId = convResponse.data.data.conversation.id;
        setConversationId(convId);
        
        const assistantMessage = convResponse.data.data.firstMessage;
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const response = await apiClient.post(`/ai/conversations/${convId}/messages`, {
          content: input,
        });
        
        const assistantMessage = response.data.data.assistantMessage;
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header - Fixed */}
      <div className="bg-white border-b p-4 flex-shrink-0">
        <h1 className="text-2xl font-bold">🤖 LOGOS AI Assistant</h1>
        <p className="text-sm text-gray-600">Ask me anything about the Bible and faith</p>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✝️</div>
            <h2 className="text-xl font-semibold mb-2">Welcome to LOGOS AI</h2>
            <p className="text-gray-600 mb-6">Ask me about Bible verses, theology, or your spiritual journey</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <Button variant="outline" onClick={() => setInput("What does the Bible say about prayer?")} className="text-left">
                📖 What does the Bible say about prayer?
              </Button>
              <Button variant="outline" onClick={() => setInput("How can I grow spiritually?")} className="text-left">
                🌱 How can I grow spiritually?
              </Button>
              <Button variant="outline" onClick={() => setInput("Explain John 3:16")} className="text-left">
                💡 Explain John 3:16
              </Button>
              <Button variant="outline" onClick={() => setInput("What is grace?")} className="text-left">
                ✨ What is grace?
              </Button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Card className={`max-w-[85%] md:max-w-[70%] p-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white'
                }`}>
                  <p className="text-sm md:text-base whitespace-pre-wrap break-words">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </Card>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <Card className="max-w-[70%] p-3 bg-white">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input - Fixed at bottom */}
      <div className="bg-white border-t p-3 md:p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
            placeholder="Ask about the Bible..."
            disabled={loading}
            className="flex-1 text-sm md:text-base"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()} size="sm" className="px-4 md:px-6">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
