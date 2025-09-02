# Student & Admin Dashboard Analysis

## 🎯 **Overview**

Analysis of Student and Admin dashboards reveals significant data flow issues and missing functionality that need to be addressed.

## 📊 **Student Dashboard Issues**

### **❌ Critical Problems:**

1. **Mock Data Usage**: All components use mock data instead of real API calls
2. **Missing Backend Models**: Booking and Payment models don't exist
3. **No Real API Integration**: Frontend not connected to backend
4. **Missing Student-Specific Services**: No student order/booking services

### **🔧 Required Fixes:**

#### **1. Add Missing Backend Models**
```python
# backend/services/models.py - Add these models

class Booking(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    student = models.ForeignKey("users.User", on_delete=models.CASCADE)
    booking_date = models.DateTimeField()
    booking_status = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    student = models.ForeignKey("users.User", on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES)
    transaction_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### **2. Create Student API Endpoints**
```python
# backend/services/views.py - Add student-specific viewsets

class StudentOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)

class StudentBookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(student=self.request.user)
```

#### **3. Create Student Services**
```typescript
// frontend/src/services/student.ts - New file

export const studentService = {
  getStudentOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/student/orders/');
    return response.data || [];
  },

  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/student/orders/', orderData);
    return response.data;
  },

  getStudentBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get('/student/bookings/');
    return response.data || [];
  },

  createBooking: async (bookingData: CreateBookingData): Promise<Booking> => {
    const response = await apiClient.post('/student/bookings/', bookingData);
    return response.data;
  }
};
```

#### **4. Update Student Components**
```typescript
// frontend/src/components/dashboard/StudentOrderManagement.tsx

// Replace mock data with real API
useEffect(() => {
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const fetchedOrders = await studentService.getStudentOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  fetchOrders();
}, []);
```

## 🏢 **Admin Dashboard Issues**

### **❌ Critical Problems:**

1. **Incomplete Admin API**: Missing user management endpoints
2. **No Vendor Application Management**: Cannot approve/reject applications
3. **Missing Complaint System**: No complaint handling functionality
4. **Limited Analytics**: Basic stats only

### **🔧 Required Fixes:**

#### **1. Add Admin API Endpoints**
```python
# backend/services/views.py - Add admin viewsets

class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUserType]
    queryset = User.objects.all()

class AdminVendorApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = VendorApplicationSerializer
    permission_classes = [IsAuthenticated, IsAdminUserType]
    queryset = VendorApplication.objects.all()

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUserType])
def approve_vendor_application(request, application_id):
    application = get_object_or_404(VendorApplication, id=application_id)
    application.status = 'approved'
    application.reviewed_by = request.user
    application.reviewed_at = timezone.now()
    application.save()
    
    # Update user to vendor type
    user = application.applicant
    user.user_type = 'vendor'
    user.save()
    
    return Response({'message': 'Application approved'})
```

#### **2. Add Complaint Model**
```python
# backend/services/models.py

class Complaint(models.Model):
    complainant = models.ForeignKey("users.User", on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    complaint_type = models.CharField(max_length=50, choices=COMPLAINT_TYPE_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=COMPLAINT_STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### **3. Update Admin Service**
```typescript
// frontend/src/services/admin.ts - Add missing functions

export const adminService = {
  // User Management
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/admin/users/');
    return response.data || [];
  },

  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(`/admin/users/${userId}/`, userData);
    return response.data;
  },

  // Vendor Application Management
  getVendorApplications: async (): Promise<VendorApplication[]> => {
    const response = await apiClient.get('/admin/vendor-applications/');
    return response.data || [];
  },

  approveVendorApplication: async (applicationId: number): Promise<void> => {
    await apiClient.post(`/admin/vendor-applications/${applicationId}/approve/`);
  },

  rejectVendorApplication: async (applicationId: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/vendor-applications/${applicationId}/reject/`, { notes: reason });
  },

  // Complaint Management
  getComplaints: async (): Promise<Complaint[]> => {
    const response = await apiClient.get('/admin/complaints/');
    return response.data || [];
  }
};
```

## 📋 **Implementation Priority**

### **Phase 1: Student Dashboard (High Priority)**
1. ✅ Add Booking and Payment models to backend
2. ✅ Create student-specific API endpoints
3. ✅ Create student service layer
4. ✅ Update StudentOrderManagement component
5. ✅ Update StudentBookingManagement component
6. ✅ Add StudentPaymentHistory component

### **Phase 2: Admin Dashboard (Medium Priority)**
1. ✅ Add Complaint model to backend
2. ✅ Create admin-specific API endpoints
3. ✅ Update admin service layer
4. ✅ Add user management functionality
5. ✅ Add vendor application management
6. ✅ Add complaint management

### **Phase 3: Enhancements (Low Priority)**
1. ✅ Add real-time updates
2. ✅ Implement caching
3. ✅ Add comprehensive error handling
4. ✅ Improve mobile responsiveness

## 🎯 **Expected Outcomes**

After implementing these fixes:

- ✅ **Student Dashboard**: Fully functional order, booking, and payment management
- ✅ **Admin Dashboard**: Complete user, vendor, and system management
- ✅ **Data Flow**: All operations properly store to database under user session
- ✅ **User Experience**: Smooth, responsive interface with proper feedback

## 🚀 **Next Steps**

1. **Start with Phase 1**: Implement student dashboard functionality
2. **Test thoroughly**: Ensure all data flows correctly to database
3. **Move to Phase 2**: Implement admin dashboard features
4. **Add enhancements**: Real-time updates and performance optimizations

The dashboards have good UI foundations but need significant backend integration to become fully functional.
