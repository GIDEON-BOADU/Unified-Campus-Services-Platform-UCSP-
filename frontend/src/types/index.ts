// Core User Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'vendor' | 'admin';
  // Backend compatibility - handle both camelCase and snake_case
  user_type?: 'student' | 'vendor' | 'admin';
  phoneNumber?: string;
  phone_number?: string; // Backend compatibility
  profilePicture?: string;
  profile_picture?: string; // Backend compatibility
  isActive: boolean;
  is_active?: boolean; // Backend compatibility
  createdAt: string;
  created_at?: string; // Backend compatibility
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
}

// Business/Vendor Types
export interface Business {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Owner information
  ownerId: string;
  ownerName: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  businessId: string;
  businessName: string;
  createdAt: string;
}

// Vendor Application Types
export interface VendorEnlistment {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessDescription: string;
  category: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: 'student' | 'vendor';
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Order Types
export interface Order {
  id: number;
  service: number;
  service_name: string;
  customer: number;
  customer_name: string;
  vendor_name: string;
  quantity?: number;
  special_instructions?: string;
  delivery_address?: string;
  order_status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'delivering' 
  | 'completed' 
  | 'cancelled';

export interface OrderStatusUpdate {
  order_status: OrderStatus;
}

export interface OrderFilters {
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: 'created_at' | 'total_amount' | 'customer_name';
  sort_order?: 'asc' | 'desc';
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  preparing_orders: number;
  ready_orders: number;
  delivering_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
}