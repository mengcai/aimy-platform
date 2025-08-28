'use client';

import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url: string;
    type: 'asset_doc' | 'ai_report' | 'portfolio' | 'market_data';
    relevance: number;
  }>;
  metadata?: {
    assetId?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    confidence?: number;
    disclaimer?: string;
  };
}

interface ChatContext {
  portfolioId?: string;
  assetId?: string;
  userId?: string;
  sessionId: string;
}

interface UseChatOptions {
  portfolioId?: string;
  assetId?: string;
  userId?: string;
}

interface UseChatReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearMessages: () => void;
  context: ChatContext;
}

export function useChat(options: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const contextRef = useRef<ChatContext>({
    portfolioId: options.portfolioId,
    assetId: options.assetId,
    userId: options.userId,
    sessionId: uuidv4(),
  });

  const context = contextRef.current;

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessage({
      role: 'user',
      content: content.trim(),
    });

    setIsLoading(true);
    setError(null);

    try {
      // Call the copilot API
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          context: {
            portfolioId: context.portfolioId,
            assetId: context.assetId,
            userId: context.userId,
            sessionId: context.sessionId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant message
      addMessage({
        role: 'assistant',
        content: data.content,
        sources: data.sources,
        metadata: data.metadata,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      // Add error message to chat
      addMessage({
        role: 'assistant',
        content: `I apologize, but I encountered an error while processing your request: "${errorMessage}". Please try again or contact support if the issue persists.`,
        metadata: {
          disclaimer: 'This is an error message, not financial advice.',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, context]);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages,
    context,
  };
}
