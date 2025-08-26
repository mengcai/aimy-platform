'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/use-copilot-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  AlertTriangle, 
  ExternalLink,
  Sparkles,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface CopilotChatProps {
  className?: string;
  portfolioId?: string;
  assetId?: string;
}

export function CopilotChat({ className, portfolioId, assetId }: CopilotChatProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages,
    context,
  } = useChat({ portfolioId, assetId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      await sendMessage(userMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'asset_doc':
        return <FileText className="w-3 h-3" />;
      case 'ai_report':
        return <TrendingUp className="w-3 h-3" />;
      case 'portfolio':
        return <Sparkles className="w-3 h-3" />;
      case 'market_data':
        return <Clock className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const getSourceColor = (type: string) => {
    switch (type) {
      case 'asset_doc':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ai_report':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'portfolio':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'market_data':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AIMY Copilot</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered investment assistant
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Protected</span>
            </Badge>
            {context?.assetId && (
              <Badge variant="secondary">
                Asset: {context.assetId}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Welcome to AIMY Copilot</h3>
                <p className="text-muted-foreground max-w-md">
                  I'm here to help you understand your investments, analyze AI insights, 
                  and navigate the AIMY platform. Ask me anything about your portfolio, 
                  asset documentation, or AI transparency reports.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Explain the risk profile of my current portfolio")}
                  className="h-auto p-3 text-left"
                >
                  <div className="flex flex-col items-start space-y-1">
                    <span className="font-medium">Portfolio Analysis</span>
                    <span className="text-xs text-muted-foreground">Risk assessment & insights</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Show me the next scheduled payout")}
                  className="h-auto p-3 text-left"
                >
                  <div className="flex flex-col items-start space-y-1">
                    <span className="font-medium">Payout Schedule</span>
                    <span className="text-xs text-muted-foreground">Upcoming distributions</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Summarize the AI transparency report")}
                  className="h-auto p-3 text-left"
                >
                  <div className="flex flex-col items-start space-y-1">
                    <span className="font-medium">AI Transparency</span>
                    <span className="text-xs text-muted-foreground">Model insights & metrics</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Walk me through placing an order")}
                  className="h-auto p-3 text-left"
                >
                  <div className="flex flex-col items-start space-y-1">
                    <span className="font-medium">Order Guide</span>
                    <span className="text-xs text-muted-foreground">Step-by-step trading</span>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex space-x-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      'max-w-[80%] space-y-2',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-lg px-4 py-2'
                        : 'bg-muted rounded-lg px-4 py-2'
                    )}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: message.content.replace(/\n/g, '<br />'),
                        }}
                      />
                    </div>

                    {message.role === 'assistant' && (
                      <>
                        {message.metadata?.disclaimer && (
                          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-amber-800 dark:text-amber-200">
                                <p className="font-medium">Important Disclaimer</p>
                                <p>{message.metadata.disclaimer}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {message.metadata?.riskLevel && (
                          <div className="flex items-center space-x-2">
                            <Badge className={getRiskColor(message.metadata.riskLevel)}>
                              Risk: {message.metadata.riskLevel}
                            </Badge>
                            {message.metadata.confidence && (
                              <Badge variant="outline">
                                Confidence: {Math.round(message.metadata.confidence * 100)}%
                              </Badge>
                            )}
                          </div>
                        )}

                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Sources:
                            </p>
                            <div className="space-y-1">
                              {message.sources.map((source, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-background border rounded-md"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'text-xs',
                                        getSourceColor(source.type)
                                      )}
                                    >
                                      {getSourceIcon(source.type)}
                                      <span className="ml-1 capitalize">
                                        {source.type.replace('_', ' ')}
                                      </span>
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {source.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(source.relevance * 100)}% relevant
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => window.open(source.url, '_blank')}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-sm text-muted-foreground">AIMY Copilot is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {error && (
          <div className="p-4 border-t bg-destructive/5">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your portfolio, asset docs, or AI insights..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <div className="mt-2 text-xs text-muted-foreground text-center">
            <p>
              ⚠️ AIMY Copilot provides information only and cannot give financial advice. 
              Always consult with qualified professionals for investment decisions.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
