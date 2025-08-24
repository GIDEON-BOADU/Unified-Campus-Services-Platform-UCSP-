from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets, filters
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from .models import BlacklistedToken

from .models import VendorApplication
from .permissions import IsAdminUserType
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserLoginSerializer,
    VendorApplicationSerializer,
    VendorApplicationUpdateSerializer,
    VendorApplicationListSerializer,
)


User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
@csrf_exempt
def test_request(request):
    """Test endpoint to debug request data"""
    return Response({
        'method': request.method,
        'content_type': request.content_type,
        'body': str(request.body),
        'data': request.data,
        'post': dict(request.POST),
        'headers': dict(request.headers),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
@csrf_exempt
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        data = UserProfileSerializer(user).data
        return Response({"message": "User registered successfully", "user": data}, status=status.HTTP_201_CREATED)
    return Response({"message": "Registration failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
@csrf_exempt
def login_user(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        return Response(
            {
                "message": "Login successful",
                # Backward-compatible top-level tokens
                "access": access_token,
                "refresh": refresh_token,
                # Frontend-expected nested tokens object
                "tokens": {
                    "access": access_token,
                    "refresh": refresh_token,
                },
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )
    return Response({"message": "Login failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    return Response({"user": UserProfileSerializer(request.user).data}, status=status.HTTP_200_OK)


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated", "user": serializer.data}, status=status.HTTP_200_OK)
    return Response({"message": "Update failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user(request):
    request.user.delete()
    return Response({"message": "User account deleted"}, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "put", "patch"]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "user_type", None) == "admin":
            return User.objects.all()
        return User.objects.filter(id=user.id)


class VendorApplicationViewSet(viewsets.ModelViewSet):
    """
    Manage vendor applications
    """

    queryset = VendorApplication.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "category"]
    search_fields = ["business_name", "applicant__username", "applicant__email"]
    ordering_fields = ["submitted_at", "reviewed_at", "business_name"]
    ordering = ["-submitted_at"]

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return VendorApplicationUpdateSerializer
        elif self.action == "list":
            return VendorApplicationListSerializer
        return VendorApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, "user_type", None) == "admin":
            return VendorApplication.objects.all()
        elif getattr(user, "user_type", None) == "student":
            return VendorApplication.objects.filter(applicant=user)
        return VendorApplication.objects.none()

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated()]
        elif self.action in ["update", "partial_update", "destroy", "list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "user_type", None) != "student":
            raise ValidationError("Only students can submit vendor applications.")
        existing_application = VendorApplication.objects.filter(applicant=user, status="pending").first()
        if existing_application:
            raise ValidationError("You already have a pending vendor application.")
        serializer.save(applicant=user)

    def perform_update(self, serializer):
        user = self.request.user
        if getattr(user, "user_type", None) != "admin":
            raise ValidationError("Only admins can update vendor applications.")
        serializer.save(reviewed_by=user, reviewed_at=timezone.now())


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_vendor_application(request):
    if getattr(request.user, "user_type", None) != "student":
        return Response({"detail": "Only students can submit vendor applications."}, status=status.HTTP_403_FORBIDDEN)
    serializer = VendorApplicationSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        exists = VendorApplication.objects.filter(applicant=request.user, status="pending").exists()
        if exists:
            return Response({"detail": "You already have a pending vendor application."}, status=status.HTTP_400_BAD_REQUEST)
        application = serializer.save(applicant=request.user)
        return Response({"message": "Application submitted", "application": VendorApplicationSerializer(application).data}, status=status.HTTP_201_CREATED)
    return Response({"message": "Submission failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_vendor_application(request):
    application = VendorApplication.objects.filter(applicant=request.user).order_by("-submitted_at").first()
    if not application:
        return Response({"detail": "No application found."}, status=status.HTTP_404_NOT_FOUND)
    return Response({"application": VendorApplicationSerializer(application).data}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def approve_vendor_application(request, application_id: int):
    application = get_object_or_404(VendorApplication, id=application_id)
    serializer = VendorApplicationUpdateSerializer(application, data={"status": "approved"}, partial=True, context={"request": request})
    if serializer.is_valid():
        serializer.save(reviewed_by=request.user, reviewed_at=timezone.now())
        return Response({"message": "Application approved", "application": VendorApplicationSerializer(application).data}, status=status.HTTP_200_OK)
    return Response({"message": "Approval failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUserType])
def reject_vendor_application(request, application_id: int):
    application = get_object_or_404(VendorApplication, id=application_id)
    serializer = VendorApplicationUpdateSerializer(application, data={"status": "rejected"}, partial=True, context={"request": request})
    if serializer.is_valid():
        serializer.save(reviewed_by=request.user, reviewed_at=timezone.now())
        return Response({"message": "Application rejected", "application": VendorApplicationSerializer(application).data}, status=status.HTTP_200_OK)
    return Response({"message": "Rejection failed", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def refresh_token_view(request):
    """
    Refresh access token with rotation for enhanced security.
    
    Endpoint: POST /api/auth/refresh/
    
    This endpoint implements refresh token rotation:
    - Validates the current refresh token
    - Generates new access and refresh tokens
    - Blacklists the old refresh token immediately
    - Returns new tokens to the client
    """
    refresh_token_data = request.data.get('refresh')
    
    if not refresh_token_data:
        return Response({
            'error': 'Refresh token is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Check if token is blacklisted
        if BlacklistedToken.objects.filter(token=refresh_token_data).exists():
            return Response({
                'error': 'Refresh token has been revoked'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Decode and validate refresh token using JWT library
        try:
            # Decode the refresh token to get user info
            from rest_framework_simplejwt.exceptions import TokenError
            
            # Try to decode as JWT token
            token = RefreshToken(refresh_token_data)
            user_id = token.payload.get('user_id')
            
            if not user_id:
                # Fallback: try to get user from token payload
                user_id = token.payload.get('sub')  # JWT standard field
                
            if not user_id:
                return Response({
                    'error': 'Invalid refresh token format'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get user
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({
                    'error': 'User not found'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate new tokens using JWT library
            new_refresh = RefreshToken.for_user(user)
            new_access_token = str(new_refresh.access_token)
            new_refresh_token = str(new_refresh)
            
            # Blacklist the old refresh token immediately
            BlacklistedToken.objects.create(token=refresh_token_data, user=user)
            
            return Response({
                'access': new_access_token,
                'refresh': new_refresh_token,
                'access_token_expires_in': 15 * 60,  # 15 minutes in seconds
                'refresh_token_expires_in': 7 * 24 * 60 * 60, # 7 days in seconds
                'token_type': 'Bearer'
            })
            
        except TokenError as e:
            return Response({
                'error': f'Invalid refresh token: {str(e)}'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({
            'error': 'Token refresh failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)











