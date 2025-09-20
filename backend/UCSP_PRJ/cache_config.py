"""
Cache configuration for UCSP project
Supports both Redis and in-memory caching
"""

import os
from django.core.cache import cache
from django.conf import settings

# Cache configuration
CACHE_TTL = {
    'SHORT': 60 * 5,      # 5 minutes
    'MEDIUM': 60 * 30,    # 30 minutes
    'LONG': 60 * 60 * 2,  # 2 hours
    'VERY_LONG': 60 * 60 * 24,  # 24 hours
}

def get_cache_key(prefix: str, *args) -> str:
    """Generate a cache key from prefix and arguments"""
    key_parts = [prefix] + [str(arg) for arg in args]
    return ':'.join(key_parts)

def cache_api_response(key: str, data: any, ttl: int = CACHE_TTL['MEDIUM']) -> bool:
    """Cache API response data"""
    try:
        cache.set(key, data, ttl)
        return True
    except Exception as e:
        print(f"Cache set error: {e}")
        return False

def get_cached_response(key: str) -> any:
    """Get cached API response"""
    try:
        return cache.get(key)
    except Exception as e:
        print(f"Cache get error: {e}")
        return None

def invalidate_cache_pattern(pattern: str) -> bool:
    """Invalidate cache entries matching pattern"""
    try:
        # This is a simplified version - in production you'd use Redis pattern matching
        cache.clear()
        return True
    except Exception as e:
        print(f"Cache invalidation error: {e}")
        return False

def get_cache_stats() -> dict:
    """Get cache statistics"""
    try:
        # This is a simplified version - in production you'd get real Redis stats
        return {
            'backend': settings.CACHES['default']['BACKEND'],
            'location': settings.CACHES['default'].get('LOCATION', 'N/A'),
            'timeout': settings.CACHES['default'].get('TIMEOUT', 'N/A'),
        }
    except Exception as e:
        return {'error': str(e)}

# Cache decorators
def cache_result(ttl: int = CACHE_TTL['MEDIUM'], key_prefix: str = ''):
    """Decorator to cache function results"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = get_cache_key(key_prefix or func.__name__, *args, *kwargs.values())
            
            # Try to get from cache
            cached_result = get_cached_response(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_api_response(cache_key, result, ttl)
            return result
        
        return wrapper
    return decorator

def cache_user_data(user_id: int, ttl: int = CACHE_TTL['MEDIUM']):
    """Cache user-specific data"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            cache_key = get_cache_key('user', user_id, func.__name__)
            
            cached_result = get_cached_response(cache_key)
            if cached_result is not None:
                return cached_result
            
            result = func(*args, **kwargs)
            cache_api_response(cache_key, result, ttl)
            return result
        
        return wrapper
    return decorator
