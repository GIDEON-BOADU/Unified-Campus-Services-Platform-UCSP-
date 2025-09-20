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
  // Additional backend fields
  status?: string;
  lastLogin?: string;
  last_login?: string; // Backend compatibility
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
  service_name: string;
  description: string;
  category: 'food' | 'beauty' | 'printing' | 'laundry' | 'academic' | 'transport' | 'health' | 'entertainment' | 'gym' | 'other';
  service_type: 'booking' | 'ordering' | 'contact' | 'walk_in';
  base_price: number | null;
  has_flexible_pricing: boolean;
  is_available: boolean;
  availability_status: 'available' | 'busy' | 'unavailable' | 'closed';
  contact_info: string;
  location: string;
  images: string | null;
  vendor: string; // vendor user ID
  vendor_name: string;
  vendor_phone?: string;
  created_at: string;
  updated_at: string;
  // Computed properties for UI
  can_book: boolean;
  can_order: boolean;
  can_contact?: boolean;
  requires_contact: boolean;
  can_walk_in: boolean;
  rating?: number | null;
  total_ratings?: number;
}

// Booking Types
export interface Booking {
  id: string;
  service: string; // service ID
  student: string; // student user ID
  booking_date: string;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Related data
  service_details?: Service;
  student_name?: string;
}

// Order Types
export interface Order {
  id: string;
  service: string; // service ID
  customer: string; // student user ID
  special_instructions?: string;
  delivery_address?: string;
  order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
  // Related data
  service_details?: Service;
  customer_name?: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  service_item: string; // service item ID
  quantity: number;
  price: number;
  total_price: number;
  created_at: string;
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

// Complaint Types
export interface Complaint {
  id: string;
  complainant: string;
  complainant_name: string;
  complaint_type: 'service' | 'order' | 'booking' | 'payment' | 'vendor' | 'platform' | 'other';
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_admin?: string;
  assigned_admin_name?: string;
  admin_response?: string;
  related_service?: string;
  related_service_name?: string;
  related_order?: string;
  related_order_id?: number;
  related_booking?: string;
  related_booking_id?: number;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  is_resolved: boolean;
  is_urgent: boolean;
  days_since_created: number;
}

export interface CreateComplaintData {
  complaint_type: 'service' | 'order' | 'booking' | 'payment' | 'vendor' | 'platform' | 'other';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  related_service?: string;
  related_order?: string;
  related_booking?: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  urgent: number;
  by_type: Array<{ complaint_type: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
}