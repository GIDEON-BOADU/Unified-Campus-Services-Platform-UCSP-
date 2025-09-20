// Debug WebSocket Connection
console.log('🔍 Starting WebSocket Debug Test...');

// Test token
const token = localStorage.getItem('accessToken') || 'test-token';
console.log('Token:', token.substring(0, 20) + '...');

// Test user notifications
console.log('Testing User Notifications WebSocket...');
const userWs = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

userWs.onopen = function(event) {
    console.log('✅ User WebSocket connected!');
    console.log('Event:', event);
};

userWs.onmessage = function(event) {
    console.log('📨 User WebSocket message received:', event.data);
    try {
        const data = JSON.parse(event.data);
        console.log('Parsed data:', data);
    } catch (e) {
        console.log('Failed to parse message:', e);
    }
};

userWs.onclose = function(event) {
    console.log('❌ User WebSocket closed:', event.code, event.reason);
};

userWs.onerror = function(error) {
    console.log('🚨 User WebSocket error:', error);
};

// Test vendor notifications
console.log('Testing Vendor Notifications WebSocket...');
const vendorWs = new WebSocket(`ws://localhost:8000/ws/vendor-notifications/?token=${token}`);

vendorWs.onopen = function(event) {
    console.log('✅ Vendor WebSocket connected!');
    console.log('Event:', event);
};

vendorWs.onmessage = function(event) {
    console.log('📨 Vendor WebSocket message received:', event.data);
    try {
        const data = JSON.parse(event.data);
        console.log('Parsed data:', data);
    } catch (e) {
        console.log('Failed to parse message:', e);
    }
};

vendorWs.onclose = function(event) {
    console.log('❌ Vendor WebSocket closed:', event.code, event.reason);
};

vendorWs.onerror = function(error) {
    console.log('🚨 Vendor WebSocket error:', error);
};

// Test after 5 seconds
setTimeout(() => {
    console.log('🔍 WebSocket connection test completed');
    console.log('User WS state:', userWs.readyState);
    console.log('Vendor WS state:', vendorWs.readyState);
    
    // Close connections
    userWs.close();
    vendorWs.close();
}, 5000);
