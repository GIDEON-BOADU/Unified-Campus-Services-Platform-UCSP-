import React, { useState, useEffect, useRef } from 'react';
import { aiService, AIChatMessage, AIChatResponse } from '../../services/ai';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  RotateCcw,
  Settings,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  CheckCircle
} from 'lucide-react';

interface EnhancedAIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

export const EnhancedAIChatbot: React.FC<EnhancedAIChatbotProps> = ({
  isOpen,
  onClose,
  onMinimize,
  isMinimized = false
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      message_type: 'user',
      content: inputMessage.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    setIsTyping(true);

    try {
      const response: AIChatResponse = await aiService.chat({
        message: userMessage.content,
        session_id: sessionId || undefined,
        context: {
          user_type: 'student', // This would come from auth context
          timestamp: new Date().toISOString()
        }
      });

      // Update session ID if this is a new conversation
      if (!sessionId) {
        setSessionId(response.session_id);
      }

      // Add AI response to messages
      const aiMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        message_type: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
        response_time: response.response_time
      };

      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(response.suggestions || []);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('AI chat error:', err);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message to clipboard
  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Clear conversation
  const clearConversation = async () => {
    if (!sessionId) return;
    
    try {
      await aiService.clearConversation(sessionId);
      setMessages([]);
      setSessionId(null);
      setSuggestions([]);
    } catch (err) {
      console.error('Failed to clear conversation:', err);
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-16 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Chatbot Container */}
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col ${
        isMinimized ? 'w-16 h-16' : 'w-full h-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-ucsp-green-500 to-ucsp-green-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            {!isMinimized && (
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-ucsp-green-100">Powered by AI</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {!isMinimized && (
              <>
                <button
                  onClick={clearConversation}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {onMinimize && (
                  <button
                    onClick={onMinimize}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Minimize"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-ucsp-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Welcome!</h4>
                  <p className="text-gray-600 text-sm">
                    I'm your AI assistant. I can help you find services, make bookings, check orders, and answer questions.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.message_type === 'user'
                        ? 'bg-ucsp-green-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0">
                        {message.message_type === 'user' ? (
                          <User className="w-4 h-4 mt-0.5" />
                        ) : (
                          <Bot className="w-4 h-4 mt-0.5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {formatMessageTime(message.created_at)}
                          </span>
                          <button
                            onClick={() => copyMessage(message.id, message.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                          >
                            {copiedMessageId === message.id ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-red-100 border border-red-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  id="ai-chat-input"
                  name="ai_chat_input"
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-ucsp-green-500 focus:border-transparent disabled:opacity-50"
                  aria-label="Type your message to the AI assistant"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 bg-ucsp-green-500 hover:bg-ucsp-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Minimized state */}
        {isMinimized && (
          <div className="flex items-center justify-center h-full">
            <Bot className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
