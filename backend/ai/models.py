from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class AIConversation(models.Model):
    """AI conversation session"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    session_id = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'AI Conversation'
        verbose_name_plural = 'AI Conversations'
    
    def __str__(self):
        return f"Conversation {self.session_id} - {self.user.email}"


class AIMessage(models.Model):
    """Individual message in an AI conversation"""
    MESSAGE_TYPES = [
        ('user', 'User Message'),
        ('assistant', 'AI Assistant'),
        ('system', 'System Message'),
    ]
    
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tokens_used = models.IntegerField(default=0)
    response_time = models.FloatField(default=0.0)  # in seconds
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'AI Message'
        verbose_name_plural = 'AI Messages'
    
    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."


class AIServiceRecommendation(models.Model):
    """AI-generated service recommendations"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_recommendations')
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='ai_recommendations')
    confidence_score = models.FloatField(default=0.0)  # 0.0 to 1.0
    reason = models.TextField(blank=True)
    context = models.JSONField(default=dict, blank=True)  # User preferences, history, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    is_viewed = models.BooleanField(default=False)
    is_clicked = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-confidence_score', '-created_at']
        verbose_name = 'AI Service Recommendation'
        verbose_name_plural = 'AI Service Recommendations'
        unique_together = ['user', 'service']
    
    def __str__(self):
        return f"Recommendation: {self.service.service_name} for {self.user.email}"


class AISentimentAnalysis(models.Model):
    """AI sentiment analysis of reviews and feedback"""
    REVIEW_TYPES = [
        ('service_review', 'Service Review'),
        ('vendor_feedback', 'Vendor Feedback'),
        ('general_feedback', 'General Feedback'),
    ]
    
    content = models.TextField()
    content_type = models.CharField(max_length=20, choices=REVIEW_TYPES)
    content_id = models.IntegerField()  # ID of the original content
    sentiment_score = models.FloatField()  # -1.0 to 1.0
    sentiment_label = models.CharField(max_length=20)  # positive, negative, neutral
    confidence = models.FloatField(default=0.0)
    keywords = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Sentiment Analysis'
        verbose_name_plural = 'AI Sentiment Analyses'
    
    def __str__(self):
        return f"Sentiment: {self.sentiment_label} ({self.sentiment_score:.2f})"


class AIChatbotLog(models.Model):
    """Log of chatbot interactions for analytics"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=255)
    query = models.TextField()
    response = models.TextField()
    intent = models.CharField(max_length=100, blank=True)
    entities = models.JSONField(default=dict, blank=True)
    confidence = models.FloatField(default=0.0)
    response_time = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Chatbot Log'
        verbose_name_plural = 'AI Chatbot Logs'
    
    def __str__(self):
        return f"Chatbot: {self.query[:50]}..."


class AIPerformanceMetrics(models.Model):
    """AI system performance metrics"""
    metric_name = models.CharField(max_length=100)
    metric_value = models.FloatField()
    metric_type = models.CharField(max_length=50)  # accuracy, response_time, etc.
    context = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Performance Metric'
        verbose_name_plural = 'AI Performance Metrics'
    
    def __str__(self):
        return f"{self.metric_name}: {self.metric_value}"
