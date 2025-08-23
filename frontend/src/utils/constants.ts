// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  BUSINESSES: {
    LIST: '/businesses',
    CREATE: '/businesses',
    UPDATE: (id: number) => `/businesses/${id}`,
    DELETE: (id: number) => `/businesses/${id}`,
  },
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id: number) => `/categories/${id}`,
    DELETE: (id: number) => `/categories/${id}`,
  },
  VENDOR_APPLICATIONS: {
    LIST: '/vendor-applications',
    CREATE: '/vendor-applications',
    UPDATE: (id: string) => `/vendor-applications/${id}`,
    APPROVE: (id: string) => `/vendor-applications/${id}/approve`,
    REJECT: (id: string) => `/vendor-applications/${id}/reject`,
  },
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  VENDOR: 'vendor',
  ADMIN: 'admin',
} as const;

// Business Categories
export const BUSINESS_CATEGORIES = [
  'Food & Dining',
  'Retail & Shopping',
  'Services',
  'Beauty & Wellness',
  'Technology',
  'Academic',
  'Printing & Copying',
  'Transportation',
  'Other',
] as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Complaint Priority
export const COMPLAINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Complaint Status
export const COMPLAINT_STATUS = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
} as const; 