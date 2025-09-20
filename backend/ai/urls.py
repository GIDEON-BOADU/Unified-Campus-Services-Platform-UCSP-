from django.urls import path
from . import views

urlpatterns = [
    # AI Chat
    path('chat/', views.chat_with_ai, name='ai_chat'),
    path('conversations/', views.get_conversations, name='ai_conversations'),
    path('conversations/<str:session_id>/messages/', views.get_conversation_messages, name='ai_conversation_messages'),
    path('conversations/<str:session_id>/clear/', views.clear_conversation, name='ai_clear_conversation'),
    
    # Recommendations
    path('recommendations/', views.get_recommendations, name='ai_recommendations'),
    path('recommendations/<int:recommendation_id>/viewed/', views.mark_recommendation_viewed, name='ai_mark_recommendation_viewed'),
    path('recommendations/<int:recommendation_id>/clicked/', views.mark_recommendation_clicked, name='ai_mark_recommendation_clicked'),
    
    # Sentiment Analysis
    path('sentiment/analyze/', views.analyze_sentiment, name='ai_analyze_sentiment'),
    
    # Analytics (Admin)
    path('analytics/', views.get_ai_analytics, name='ai_analytics'),
    path('recommendations/generate/', views.generate_recommendations, name='ai_generate_recommendations'),
]
