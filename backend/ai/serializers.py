from rest_framework import serializers
from .models import (
    AIConversation, 
    AIMessage, 
    AIServiceRecommendation, 
    AISentimentAnalysis,
    AIChatbotLog,
    AIPerformanceMetrics
)
from services.serializers import ServiceSerializer


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = [
            'id', 'message_type', 'content', 'metadata', 
            'created_at', 'tokens_used', 'response_time'
        ]
        read_only_fields = ['id', 'created_at']


class AIConversationSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AIConversation
        fields = [
            'id', 'session_id', 'title', 'created_at', 
            'updated_at', 'is_active', 'messages', 'message_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()


class AIServiceRecommendationSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    service_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = AIServiceRecommendation
        fields = [
            'id', 'service', 'service_id', 'confidence_score', 
            'reason', 'context', 'created_at', 'is_viewed', 'is_clicked'
        ]
        read_only_fields = ['id', 'created_at']


class AISentimentAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AISentimentAnalysis
        fields = [
            'id', 'content', 'content_type', 'content_id',
            'sentiment_score', 'sentiment_label', 'confidence',
            'keywords', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AIChatbotLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIChatbotLog
        fields = [
            'id', 'user', 'session_id', 'query', 'response',
            'intent', 'entities', 'confidence', 'response_time', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AIPerformanceMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIPerformanceMetrics
        fields = [
            'id', 'metric_name', 'metric_value', 'metric_type',
            'context', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AIChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000)
    session_id = serializers.CharField(max_length=255, required=False)
    context = serializers.JSONField(default=dict, required=False)


class AIChatResponseSerializer(serializers.Serializer):
    response = serializers.CharField()
    session_id = serializers.CharField()
    intent = serializers.CharField()
    entities = serializers.JSONField()
    confidence = serializers.FloatField()
    suggestions = serializers.ListField(child=serializers.CharField(), required=False)
