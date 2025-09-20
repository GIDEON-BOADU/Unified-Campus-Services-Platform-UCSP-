import json
import uuid
import time
from datetime import datetime, timedelta
from django.db.models import Q, Avg, Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import (
    AIConversation, AIMessage, AIServiceRecommendation, 
    AISentimentAnalysis, AIChatbotLog, AIPerformanceMetrics
)
from .serializers import (
    AIConversationSerializer, AIMessageSerializer, AIServiceRecommendationSerializer,
    AISentimentAnalysisSerializer, AIChatbotLogSerializer, AIPerformanceMetricsSerializer,
    AIChatRequestSerializer, AIChatResponseSerializer
)
from services.models import Service, Order
from bookings.models import Booking

User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """Main AI chat endpoint"""
    serializer = AIChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    message = serializer.validated_data['message']
    session_id = serializer.validated_data.get('session_id')
    context = serializer.validated_data.get('context', {})
    
    start_time = time.time()
    
    try:
        # Get or create conversation
        if session_id:
            conversation, created = AIConversation.objects.get_or_create(
                session_id=session_id,
                user=request.user,
                defaults={'title': message[:50]}
            )
        else:
            session_id = str(uuid.uuid4())
            conversation = AIConversation.objects.create(
                session_id=session_id,
                user=request.user,
                title=message[:50]
            )
        
        # Save user message
        user_message = AIMessage.objects.create(
            conversation=conversation,
            message_type='user',
            content=message,
            metadata=context
        )
        
        # Generate AI response (mock implementation)
        ai_response = generate_ai_response(message, request.user, context)
        
        # Save AI response
        response_time = time.time() - start_time
        ai_message = AIMessage.objects.create(
            conversation=conversation,
            message_type='assistant',
            content=ai_response['response'],
            metadata=ai_response.get('metadata', {}),
            tokens_used=ai_response.get('tokens_used', 0),
            response_time=response_time
        )
        
        # Log chatbot interaction
        AIChatbotLog.objects.create(
            user=request.user,
            session_id=session_id,
            query=message,
            response=ai_response['response'],
            intent=ai_response.get('intent', 'general'),
            entities=ai_response.get('entities', {}),
            confidence=ai_response.get('confidence', 0.8),
            response_time=response_time
        )
        
        # Update conversation timestamp
        conversation.updated_at = timezone.now()
        conversation.save()
        
        return Response({
            'response': ai_response['response'],
            'session_id': session_id,
            'intent': ai_response.get('intent', 'general'),
            'entities': ai_response.get('entities', {}),
            'confidence': ai_response.get('confidence', 0.8),
            'suggestions': ai_response.get('suggestions', []),
            'response_time': response_time
        })
        
    except Exception as e:
        return Response(
            {'error': f'AI service error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def generate_ai_response(message, user, context):
    """Generate AI response based on message and context"""
    message_lower = message.lower()
    
    # Simple intent detection
    intent = 'general'
    entities = {}
    confidence = 0.8
    
    # Service-related queries
    if any(word in message_lower for word in ['service', 'services', 'find', 'search', 'looking for']):
        intent = 'service_search'
        # Extract service-related entities
        if 'laundry' in message_lower:
            entities['service_type'] = 'laundry'
        elif 'food' in message_lower or 'restaurant' in message_lower:
            entities['service_type'] = 'food'
        elif 'printing' in message_lower:
            entities['service_type'] = 'printing'
    
    # Booking-related queries
    elif any(word in message_lower for word in ['book', 'booking', 'appointment', 'schedule']):
        intent = 'booking'
    
    # Payment-related queries
    elif any(word in message_lower for word in ['pay', 'payment', 'money', 'cost', 'price']):
        intent = 'payment'
    
    # Order-related queries
    elif any(word in message_lower for word in ['order', 'orders', 'my order', 'order status']):
        intent = 'order_status'
    
    # Generate response based on intent
    if intent == 'service_search':
        response = generate_service_search_response(message, entities, user)
    elif intent == 'booking':
        response = generate_booking_response(message, user)
    elif intent == 'payment':
        response = generate_payment_response(message, user)
    elif intent == 'order_status':
        response = generate_order_status_response(message, user)
    else:
        response = generate_general_response(message, user)
    
    return {
        'response': response,
        'intent': intent,
        'entities': entities,
        'confidence': confidence,
        'metadata': {
            'user_id': user.id,
            'user_type': user.user_type,
            'timestamp': timezone.now().isoformat()
        },
        'tokens_used': len(message.split()) + len(response.split()),
        'suggestions': get_suggestions(intent, entities)
    }


def generate_service_search_response(message, entities, user):
    """Generate response for service search queries"""
    service_type = entities.get('service_type', '')
    
    if service_type:
        services = Service.objects.filter(
            service_name__icontains=service_type,
            is_available=True
        )[:3]
        
        if services.exists():
            service_list = '\n'.join([f"• {s.service_name} - ₵{s.base_price}" for s in services])
            return f"I found some {service_type} services for you:\n\n{service_list}\n\nWould you like to see more details about any of these services?"
        else:
            return f"I couldn't find any {service_type} services available right now. Try browsing our services page to see what's available!"
    else:
        return "I can help you find services! What type of service are you looking for? For example, you can ask about laundry, food, printing, or other services."


def generate_booking_response(message, user):
    """Generate response for booking queries"""
    return "I can help you with bookings! You can book appointments through our services page. What service would you like to book?"


def generate_payment_response(message, user):
    """Generate response for payment queries"""
    return "I can help you with payment questions! You can make payments using Mobile Money (MTN, Airtel, or Telecel). What payment information do you need?"


def generate_order_status_response(message, user):
    """Generate response for order status queries"""
    return "I can help you check your order status! You can view all your orders in the dashboard. Is there a specific order you'd like to know about?"


def generate_general_response(message, user):
    """Generate general response"""
    responses = [
        "I'm here to help! How can I assist you today?",
        "I can help you find services, make bookings, check orders, or answer questions about payments. What would you like to know?",
        "Hello! I'm your AI assistant. I can help you navigate our platform and find what you need.",
        "I'm here to help! Feel free to ask me about our services, bookings, orders, or anything else you need assistance with."
    ]
    
    import random
    return random.choice(responses)


def get_suggestions(intent, entities):
    """Get contextual suggestions based on intent"""
    if intent == 'service_search':
        return [
            "Show me laundry services",
            "Find food services",
            "What printing services are available?"
        ]
    elif intent == 'booking':
        return [
            "Book an appointment",
            "Check my bookings",
            "Cancel a booking"
        ]
    elif intent == 'payment':
        return [
            "How do I pay?",
            "What payment methods are accepted?",
            "Check my payment history"
        ]
    else:
        return [
            "Find services",
            "Make a booking",
            "Check my orders",
            "Payment help"
        ]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """Get user's AI conversations"""
    conversations = AIConversation.objects.filter(
        user=request.user,
        is_active=True
    ).order_by('-updated_at')
    
    serializer = AIConversationSerializer(conversations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, session_id):
    """Get messages for a specific conversation"""
    try:
        conversation = AIConversation.objects.get(
            session_id=session_id,
            user=request.user
        )
        messages = conversation.messages.all().order_by('created_at')
        serializer = AIMessageSerializer(messages, many=True)
        return Response(serializer.data)
    except AIConversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_conversation(request, session_id):
    """Clear a conversation"""
    try:
        conversation = AIConversation.objects.get(
            session_id=session_id,
            user=request.user
        )
        conversation.messages.all().delete()
        conversation.delete()
        return Response({'message': 'Conversation cleared successfully'})
    except AIConversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    """Get AI service recommendations for user"""
    recommendations = AIServiceRecommendation.objects.filter(
        user=request.user,
        is_viewed=False
    ).order_by('-confidence_score')[:10]
    
    serializer = AIServiceRecommendationSerializer(recommendations, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_recommendation_viewed(request, recommendation_id):
    """Mark a recommendation as viewed"""
    try:
        recommendation = AIServiceRecommendation.objects.get(
            id=recommendation_id,
            user=request.user
        )
        recommendation.is_viewed = True
        recommendation.save()
        return Response({'message': 'Recommendation marked as viewed'})
    except AIServiceRecommendation.DoesNotExist:
        return Response(
            {'error': 'Recommendation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_recommendation_clicked(request, recommendation_id):
    """Mark a recommendation as clicked"""
    try:
        recommendation = AIServiceRecommendation.objects.get(
            id=recommendation_id,
            user=request.user
        )
        recommendation.is_clicked = True
        recommendation.save()
        return Response({'message': 'Recommendation marked as clicked'})
    except AIServiceRecommendation.DoesNotExist:
        return Response(
            {'error': 'Recommendation not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_sentiment(request):
    """Analyze sentiment of text content"""
    content = request.data.get('content')
    content_type = request.data.get('content_type', 'general_feedback')
    content_id = request.data.get('content_id')
    
    if not content:
        return Response(
            {'error': 'Content is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Simple sentiment analysis (mock implementation)
    sentiment_score, sentiment_label, confidence = analyze_text_sentiment(content)
    
    # Extract keywords
    keywords = extract_keywords(content)
    
    # Save analysis
    analysis = AISentimentAnalysis.objects.create(
        content=content,
        content_type=content_type,
        content_id=content_id or 0,
        sentiment_score=sentiment_score,
        sentiment_label=sentiment_label,
        confidence=confidence,
        keywords=keywords
    )
    
    serializer = AISentimentAnalysisSerializer(analysis)
    return Response(serializer.data)


def analyze_text_sentiment(text):
    """Simple sentiment analysis implementation"""
    positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect']
    negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return 0.7, 'positive', 0.8
    elif negative_count > positive_count:
        return -0.7, 'negative', 0.8
    else:
        return 0.0, 'neutral', 0.6


def extract_keywords(text):
    """Extract keywords from text"""
    # Simple keyword extraction (in real implementation, use NLP libraries)
    words = text.lower().split()
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
    
    keywords = [word for word in words if len(word) > 3 and word not in stop_words]
    return list(set(keywords))[:10]  # Return top 10 unique keywords


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ai_analytics(request):
    """Get AI system analytics (admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get analytics data
    total_conversations = AIConversation.objects.count()
    total_messages = AIMessage.objects.count()
    avg_response_time = AIMessage.objects.filter(
        message_type='assistant'
    ).aggregate(avg_time=Avg('response_time'))['avg_time'] or 0
    
    # Intent distribution
    intent_distribution = AIChatbotLog.objects.values('intent').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Sentiment distribution
    sentiment_distribution = AISentimentAnalysis.objects.values('sentiment_label').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'total_conversations': total_conversations,
        'total_messages': total_messages,
        'avg_response_time': round(avg_response_time, 2),
        'intent_distribution': list(intent_distribution),
        'sentiment_distribution': list(sentiment_distribution)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_recommendations(request):
    """Generate AI recommendations for user (admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    user_id = request.data.get('user_id')
    if not user_id:
        return Response(
            {'error': 'User ID is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id)
        recommendations = generate_user_recommendations(user)
        
        return Response({
            'message': f'Generated {len(recommendations)} recommendations for {user.email}',
            'recommendations': len(recommendations)
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


def generate_user_recommendations(user):
    """Generate personalized service recommendations for user"""
    # Get user's order history
    user_orders = Order.objects.filter(student=user)
    user_bookings = Booking.objects.filter(student=user)
    
    # Get user's preferred service types
    preferred_types = []
    if user_orders.exists():
        service_ids = user_orders.values_list('service', flat=True)
        preferred_types = Service.objects.filter(
            id__in=service_ids
        ).values_list('service_type', flat=True).distinct()
    
    # Generate recommendations based on preferences
    recommendations = []
    services = Service.objects.filter(is_available=True).exclude(
        id__in=user_orders.values_list('service', flat=True)
    )[:5]
    
    for service in services:
        confidence = 0.5  # Base confidence
        
        # Increase confidence if service type matches user preferences
        if service.service_type in preferred_types:
            confidence += 0.3
        
        # Increase confidence for popular services
        if service.rating and service.rating > 4.0:
            confidence += 0.2
        
        if confidence > 0.3:  # Only recommend if confidence is above threshold
            recommendation = AIServiceRecommendation.objects.create(
                user=user,
                service=service,
                confidence_score=min(confidence, 1.0),
                reason=f"Based on your preferences and service popularity",
                context={
                    'user_orders_count': user_orders.count(),
                    'user_bookings_count': user_bookings.count(),
                    'service_rating': service.rating or 0,
                    'service_type_match': service.service_type in preferred_types
                }
            )
            recommendations.append(recommendation)
    
    return recommendations
