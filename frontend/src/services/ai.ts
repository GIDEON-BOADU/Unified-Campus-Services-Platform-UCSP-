import { apiClient } from './api';

export interface AIChatMessage {
  id: string;
  message_type: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
  tokens_used?: number;
  response_time?: number;
}

export interface AIConversation {
  id: number;
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  messages: AIChatMessage[];
  message_count: number;
}

export interface AIServiceRecommendation {
  id: number;
  service: {
    id: number;
    service_name: string;
    description: string;
    base_price: number;
    service_type: string;
    category: string;
    rating?: number;
    image?: string;
  };
  confidence_score: number;
  reason: string;
  context: any;
  created_at: string;
  is_viewed: boolean;
  is_clicked: boolean;
}

export interface AIChatRequest {
  message: string;
  session_id?: string;
  context?: any;
}

export interface AIChatResponse {
  response: string;
  session_id: string;
  intent: string;
  entities: any;
  confidence: number;
  suggestions?: string[];
  response_time?: number;
}

export interface SentimentAnalysis {
  id: number;
  content: string;
  content_type: string;
  content_id: number;
  sentiment_score: number;
  sentiment_label: string;
  confidence: number;
  keywords: string[];
  created_at: string;
}

export const aiService = {
  // Chat with AI
  chat: async (request: AIChatRequest): Promise<AIChatResponse> => {
    try {
      const response = await apiClient.post('/ai/chat/', request);
      return response;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },

  // Get conversations
  getConversations: async (): Promise<AIConversation[]> => {
    try {
      const response = await apiClient.get('/ai/conversations/');
      return response;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get conversation messages
  getConversationMessages: async (sessionId: string): Promise<AIChatMessage[]> => {
    try {
      const response = await apiClient.get(`/ai/conversations/${sessionId}/messages/`);
      return response;
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  },

  // Clear conversation
  clearConversation: async (sessionId: string): Promise<void> => {
    try {
      await apiClient.post(`/ai/conversations/${sessionId}/clear/`);
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw error;
    }
  },

  // Get recommendations
  getRecommendations: async (): Promise<AIServiceRecommendation[]> => {
    try {
      const response = await apiClient.get('/ai/recommendations/');
      return response;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  // Mark recommendation as viewed
  markRecommendationViewed: async (recommendationId: number): Promise<void> => {
    try {
      await apiClient.post(`/ai/recommendations/${recommendationId}/viewed/`);
    } catch (error) {
      console.error('Error marking recommendation as viewed:', error);
      throw error;
    }
  },

  // Mark recommendation as clicked
  markRecommendationClicked: async (recommendationId: number): Promise<void> => {
    try {
      await apiClient.post(`/ai/recommendations/${recommendationId}/clicked/`);
    } catch (error) {
      console.error('Error marking recommendation as clicked:', error);
      throw error;
    }
  },

  // Analyze sentiment
  analyzeSentiment: async (content: string, contentType: string = 'general_feedback', contentId?: number): Promise<SentimentAnalysis> => {
    try {
      const response = await apiClient.post('/ai/sentiment/analyze/', {
        content,
        content_type: contentType,
        content_id: contentId
      });
      return response;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  },

  // Get AI analytics (admin only)
  getAnalytics: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/ai/analytics/');
      return response;
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      throw error;
    }
  },

  // Generate recommendations (admin only)
  generateRecommendations: async (userId: number): Promise<any> => {
    try {
      const response = await apiClient.post('/ai/recommendations/generate/', {
        user_id: userId
      });
      return response;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }
};

export default aiService;
