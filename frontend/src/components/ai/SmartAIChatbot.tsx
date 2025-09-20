import React, { useState, useEffect, useRef } from 'react';
import { aiService, AIChatMessage, AIChatResponse, AIServiceRecommendation } from '../../services/ai';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Send, 
  X, 
  Bot, 
  User, 
  Minimize2,
  RotateCcw,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  CheckCircle,
  Mic,
  MicOff,
  History,
  Star,
  Lightbulb,
  Search,
  Calendar,
  Package,
  CreditCard
} from 'lucide-react';

interface SmartAIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  onServiceSelect?: (service: any) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

export const SmartAIChatbot: React.FC<SmartAIChatbotProps> = ({
  isOpen,
  onClose,
  onMinimize,
  isMinimized = false,
  onServiceSelect
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [recommendations, setRecommendations] = useState<AIServiceRecommendation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'positive' | 'negative' | null>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setIsRecording(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        setIsRecording(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
      
      setRecognition(recognition);
    }
  }, []);

  // Load conversations and recommendations on mount
  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
      loadRecommendations();
    }
  }, [isOpen, user]);

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

  const loadConversations = async () => {
    try {
      const convos = await aiService.getConversations();
      setConversations(convos.map(conv => ({
        id: conv.session_id,
        title: conv.title,
        lastMessage: conv.messages[conv.messages.length - 1]?.content || 'No messages',
        timestamp: conv.updated_at,
        messageCount: conv.message_count
      })));
    } catch (error) {
      console.warn('AI conversations not available:', error);
      // Set empty conversations array instead of showing error
      setConversations([]);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await aiService.getRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.warn('AI recommendations not available:', error);
      // Set empty recommendations array instead of showing error
      setRecommendations([]);
    }
  };

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
          user_type: user?.user_type || 'student',
          user_id: user?.id,
          timestamp: new Date().toISOString(),
          location: 'campus',
          preferences: {}
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
      
      // Refresh recommendations after interaction
      loadRecommendations();
    } catch (err) {
      // Provide a helpful fallback response when AI backend is not available
      const fallbackMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        message_type: 'assistant',
        content: `I understand you're asking about "${userMessage.content}". I'm currently learning about our campus services and would be happy to help you find what you need. You can browse our services or contact support for immediate assistance.`,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setSuggestions([
        'Show me available services',
        'How do I make a booking?',
        'What payment methods are accepted?',
        'Contact support'
      ]);
      
      console.warn('AI backend not available, using fallback response:', err);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
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

  // Handle feedback
  const handleFeedback = async (messageId: string, type: 'positive' | 'negative') => {
    setFeedback(prev => ({ ...prev, [messageId]: type }));
    
    // Here you would typically send feedback to the backend
    try {
      // await aiService.submitFeedback(messageId, type);
      console.log(`Feedback submitted: ${type} for message ${messageId}`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
      loadConversations();
    } catch (err) {
      console.error('Failed to clear conversation:', err);
    }
  };

  // Load conversation
  const loadConversation = async (conversationId: string) => {
    try {
      const messages = await aiService.getConversationMessages(conversationId);
      setMessages(messages);
      setSessionId(conversationId);
      setShowHistory(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'find-services',
      label: 'Find Services',
      icon: <Search className="w-4 h-4" />,
      action: () => setInputMessage('Find services near me'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'book-appointment',
      label: 'Book Appointment',
      icon: <Calendar className="w-4 h-4" />,
      action: () => setInputMessage('I want to book an appointment'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'check-orders',
      label: 'Check Orders',
      icon: <Package className="w-4 h-4" />,
      action: () => setInputMessage('Show me my orders'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'payment-help',
      label: 'Payment Help',
      icon: <CreditCard className="w-4 h-4" />,
      action: () => setInputMessage('Help with payment'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] transition-all duration-300 ${
      isMinimized ? 'w-16 h-16' : 'w-[420px] h-[700px]'
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
                <p className="text-xs text-ucsp-green-100">Powered by Advanced AI</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {!isMinimized && (
              <>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Conversation History"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Recommendations"
                >
                  <Lightbulb className="w-4 h-4" />
                </button>
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
            {/* Sidebar */}
            {(showHistory || showRecommendations) && (
              <div className="w-1/3 border-r border-gray-200 bg-gray-50">
                {showHistory && (
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Conversations</h4>
                    <div className="space-y-2">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => loadConversation(conv.id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-white transition-colors border border-gray-200"
                        >
                          <div className="font-medium text-sm text-gray-900 truncate">{conv.title}</div>
                          <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
                          <div className="text-xs text-gray-400">{conv.messageCount} messages</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {showRecommendations && (
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Recommended Services</h4>
                    <div className="space-y-2">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-3 rounded-lg border border-gray-200 bg-white cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => onServiceSelect?.(rec.service)}
                        >
                          <div className="font-medium text-sm text-gray-900">{rec.service.service_name}</div>
                          <div className="text-xs text-gray-500">{rec.service.description}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-green-600 font-medium">
                              {Math.round(rec.confidence_score * 100)}% match
                            </span>
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col ${showHistory || showRecommendations ? 'w-2/3' : 'w-full'}`}>
              {/* Quick Actions */}
              {messages.length === 0 && (
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={action.action}
                        className={`${action.color} text-white p-3 rounded-lg flex items-center gap-2 transition-colors`}
                      >
                        {action.icon}
                        <span className="text-sm font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-ucsp-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Welcome!</h4>
                    <p className="text-gray-600 text-sm">
                      I'm your advanced AI assistant. I can help you find services, make bookings, check orders, and answer questions.
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
                            <div className="flex items-center gap-1">
                              {message.message_type === 'assistant' && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleFeedback(message.id, 'positive')}
                                    className={`p-1 rounded ${
                                      feedback[message.id] === 'positive' 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(message.id, 'negative')}
                                    className={`p-1 rounded ${
                                      feedback[message.id] === 'negative' 
                                        ? 'bg-red-100 text-red-600' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
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
                  <button
                    onClick={handleVoiceInput}
                    disabled={!recognition}
                    className={`p-2 rounded-full transition-colors ${
                      isListening 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  
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
