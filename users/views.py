"""
User views for authentication and user management.
Provides endpoints for user registration, profile management, and authentication.
"""
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from .serializers import UserSerializer, UserProfileSerializer, UserLoginSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user.
    
    Endpoint: POST /api/users/register/
    
    Required fields:
    - username: Unique username
    - email: Valid email address
    - password: Secure password
    - password_confirm: Password confirmation
    - user_type: 'student', 'vendor', or 'admin'
    - phone_number: Valid phone number
    
    Optional fields:
    - first_name: User's first name
    - last_name: User's last name
    - profile_picture: User's profile image
    
    Returns:
    - 201: User created successfully
    - 400: Validation errors
    - 409: Username/email already exists
    """
    try:
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens for the new user
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
        
        # Return detailed validation errors
        return Response({
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except IntegrityError as e:
        # Handle duplicate username/email
        if 'username' in str(e):
            return Response({
                'message': 'Registration failed',
                'errors': {'username': 'Username already exists.'}
            }, status=status.HTTP_409_CONFLICT)
        elif 'email' in str(e):
            return Response({
                'message': 'Registration failed',
                'errors': {'email': 'Email already exists.'}
            }, status=status.HTTP_409_CONFLICT)
        else:
            return Response({
                'message': 'Registration failed',
                'errors': {'detail': 'User with this information already exists.'}
            }, status=status.HTTP_409_CONFLICT)
    
    except Exception as e:
        return Response({
            'message': 'Registration failed',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login user and return JWT tokens.
    
    Endpoint: POST /api/users/login/
    
    Required fields:
    - username: Username or email
    - password: User password
    
    Returns:
    - 200: Login successful with tokens
    - 400: Invalid credentials
    """
    try:
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'message': 'Login failed',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user profile.
    
    Endpoint: GET /api/users/profile/
    
    Authentication: Required (JWT token)
    
    Returns:
    - 200: User profile data
    - 401: Unauthorized
    """
    try:
        serializer = UserProfileSerializer(request.user)
        return Response({
            'message': 'Profile retrieved successfully',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'Failed to retrieve profile',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update current user profile.
    
    Endpoint: PUT/PATCH /api/users/profile/update/
    
    Authentication: Required (JWT token)
    
    Allowed fields:
    - email: New email address
    - phone_number: New phone number
    - first_name: First name
    - last_name: Last name
    - profile_picture: Profile image
    
    Returns:
    - 200: Profile updated successfully
    - 400: Validation errors
    - 401: Unauthorized
    """
    try:
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'message': 'Profile update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except IntegrityError as e:
        # Handle duplicate email
        if 'email' in str(e):
            return Response({
                'message': 'Profile update failed',
                'errors': {'email': 'Email already exists.'}
            }, status=status.HTTP_409_CONFLICT)
        
        return Response({
            'message': 'Profile update failed',
            'errors': {'detail': 'An error occurred while updating profile.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        return Response({
            'message': 'Profile update failed',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request):
    """
    Delete current user account.
    
    Endpoint: DELETE /api/users/delete/
    
    Authentication: Required (JWT token)
    
    Returns:
    - 204: User deleted successfully
    - 401: Unauthorized
    """
    try:
        user = request.user
        user.delete()
        
        return Response({
            'message': 'User account deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)
        
    except Exception as e:
        return Response({
            'message': 'Failed to delete user account',
            'errors': {'detail': 'An unexpected error occurred.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)