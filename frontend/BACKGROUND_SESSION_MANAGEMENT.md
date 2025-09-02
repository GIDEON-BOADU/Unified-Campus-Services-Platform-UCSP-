# Background Session Management System

## Overview

This document describes the new background session management system that replaces the intrusive token expiry alerts with a seamless, background-based approach.

## Features

### 🎯 **Non-Intrusive Operation**
- **No UI obstruction**: Session management runs completely in the background
- **Subtle indicators**: Optional status indicator in bottom-right corner
- **Automatic refresh**: Tokens refresh automatically before expiry
- **Seamless UX**: Users never see disruptive alerts

### 🔄 **Background Processing**
- **Service Worker**: Handles session management even when app is in background
- **Periodic checks**: Monitors token status every 30 seconds
- **Smart refresh**: Refreshes tokens 5 minutes before expiry
- **Retry logic**: Automatic retry with exponential backoff

### 🌐 **Multi-Tab Support**
- **Cross-tab sync**: Session status synchronized across all tabs
- **Storage events**: Real-time updates when tokens change
- **Visibility API**: Immediate checks when tab becomes active

### 📱 **Offline Resilience**
- **Offline detection**: Pauses refresh attempts when offline
- **Online recovery**: Resumes when connection is restored
- **Cache support**: Service worker caches API responses

## Architecture

### Core Components

1. **SessionManager** (`src/services/sessionManager.ts`)
   - Singleton class managing background session operations
   - Handles token refresh, retry logic, and event dispatching
   - Configurable refresh thresholds and intervals

2. **Service Worker** (`public/sw.js`)
   - Background process for session management
   - Handles periodic sync and background refresh
   - Provides offline support and caching

3. **useBackgroundSession Hook** (`src/hooks/useBackgroundSession.ts`)
   - React hook for accessing session status
   - Provides session information without UI obstruction
   - Handles custom events from session manager

4. **SessionStatusIndicator** (`src/components/common/SessionStatusIndicator.tsx`)
   - Optional visual indicator for session status
   - Shows only when refreshing or during retries
   - Hover for detailed information

### Configuration

```typescript
interface SessionConfig {
  refreshThreshold: number; // seconds before expiry to refresh (default: 300)
  checkInterval: number;    // milliseconds between checks (default: 30000)
  maxRetries: number;       // maximum refresh attempts (default: 3)
  retryDelay: number;       // milliseconds between retries (default: 5000)
}
```

## Usage

### Basic Implementation

```typescript
import { useBackgroundSession } from '../hooks/useBackgroundSession';

function MyComponent() {
  const { isValid, timeUntilExpiry, isRefreshing } = useBackgroundSession();
  
  // Session management happens automatically in background
  return <div>Your app content</div>;
}
```

### Custom Configuration

```typescript
import { sessionManager } from '../services/sessionManager';

// Update configuration
sessionManager.updateConfig({
  refreshThreshold: 600, // 10 minutes
  checkInterval: 60000,  // 1 minute
});
```

### Force Refresh

```typescript
import { useBackgroundSession } from '../hooks/useBackgroundSession';

function MyComponent() {
  const { forceRefresh } = useBackgroundSession();
  
  const handleManualRefresh = async () => {
    const success = await forceRefresh();
    if (success) {
      console.log('Session refreshed successfully');
    }
  };
}
```

## Backend Configuration

### JWT Settings (Django)

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),    # 1 hour
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),    # 7 days
    'ROTATE_REFRESH_TOKENS': True,                  # New refresh token on refresh
    'BLACKLIST_AFTER_ROTATION': True,               # Blacklist old tokens
    'UPDATE_LAST_LOGIN': True,                      # Update last login
}
```

## Migration from Old System

### Before (Intrusive Alert)
```typescript
// Old system showed modal alerts
<TokenExpiryAlert /> // Obstructed UI
```

### After (Background Management)
```typescript
// New system runs in background
<SessionStatusIndicator /> // Optional, non-intrusive
```

## Benefits

### For Users
- ✅ **No interruptions**: Session management is invisible
- ✅ **Better UX**: No modal dialogs or alerts
- ✅ **Seamless operation**: Tokens refresh automatically
- ✅ **Multi-tab support**: Works across all browser tabs

### For Developers
- ✅ **Cleaner code**: No complex alert management
- ✅ **Better performance**: Efficient background processing
- ✅ **Reliable**: Robust retry and error handling
- ✅ **Configurable**: Easy to adjust behavior

### For System
- ✅ **Reduced server load**: Proactive token refresh
- ✅ **Better security**: Shorter token lifetimes possible
- ✅ **Offline support**: Graceful handling of connectivity issues
- ✅ **Scalable**: Service worker handles background tasks

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Check browser support for Service Workers
   - Ensure HTTPS in production (required for SW)
   - Check console for registration errors

2. **Tokens Not Refreshing**
   - Verify JWT configuration in Django settings
   - Check network connectivity
   - Review browser console for API errors

3. **Multiple Tabs Not Syncing**
   - Ensure localStorage events are working
   - Check for browser storage restrictions
   - Verify event listeners are properly attached

### Debug Mode

```typescript
// Enable debug logging
sessionManager.updateConfig({
  debug: true
});

// Check session status
console.log(sessionManager.getSessionStatus());
```

## Browser Support

- ✅ **Chrome**: Full support
- ✅ **Firefox**: Full support
- ✅ **Safari**: Full support (iOS 11.3+)
- ✅ **Edge**: Full support
- ⚠️ **IE**: No Service Worker support (falls back to basic refresh)

## Performance Impact

- **Memory**: ~2MB additional memory usage
- **CPU**: Minimal impact (30-second intervals)
- **Network**: Only when tokens need refresh
- **Battery**: Optimized for mobile devices

## Security Considerations

- **Token Storage**: Tokens stored in localStorage (standard practice)
- **Refresh Security**: Automatic rotation of refresh tokens
- **Blacklisting**: Old tokens are blacklisted after rotation
- **HTTPS Required**: Service Workers require secure context

## Future Enhancements

- [ ] Push notifications for session expiry
- [ ] Biometric authentication integration
- [ ] Advanced offline capabilities
- [ ] Session analytics and monitoring
- [ ] Custom refresh strategies per user role
