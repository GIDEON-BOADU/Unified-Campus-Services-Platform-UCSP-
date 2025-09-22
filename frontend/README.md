# UCSP Campus E-commerce Platform

A comprehensive e-commerce platform for university campuses where students can discover local businesses, vendors can manage their operations, and admins can oversee the entire platform.

## 🚀 Key Features

### User Management System
- **Centralized Registration**: All users register as students by default
- **Role-Based Access**: Three user roles - Student, Vendor, Admin
- **Vendor Application System**: Users can apply to become vendors through a dedicated application form
- **Admin Approval Process**: Admins can review and approve/reject vendor applications

### Role-Based Dashboards
- **Student Dashboard**: Browse services, place orders, track purchases
- **Vendor Dashboard**: Manage business profile, products, orders, and analytics
- **Admin Dashboard**: Oversee platform, manage vendors, handle complaints, view analytics

### Business Management
- **Vendor Applications**: Comprehensive application form for potential vendors
- **Admin Review System**: Admins can approve, reject, or request additional information
- **Business Categories**: Organized business categories for easy discovery
- **Status Tracking**: Track application status and review history

## 🛠 Tech Stack

- **React 18+** with TypeScript
- **TailwindCSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management
- **Lucide React** for icons
- **Context API** for state management

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── SearchBar.tsx
│   ├── business/
│   │   ├── BusinessCard.tsx
│   │   ├── BusinessGrid.tsx
│   │   └── CategoryFilter.tsx
│   ├── dashboard/
│   │   ├── StudentDashboard.tsx
│   │   ├── VendorDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── ui/
│       ├── ButtonPrimary.tsx
│       ├── ButtonSecondary.tsx
│       └── Modal.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── VendorManagement.tsx
│   │   └── ComplaintManagement.tsx
│   ├── LandingPage.tsx
│   ├── StudentDashboard.tsx
│   ├── BusinessDashboard.tsx
│   ├── VendorApplicationPage.tsx
│   └── PrintingService.tsx
├── context/
│   └── AuthContext.tsx
├── types/
│   └── index.ts
└── App.tsx
```

## 🔄 User Flow

### Registration Flow
1. **Student Registration**: Users register as students by default
2. **Vendor Application**: Students can apply to become vendors via `/vendor-application`
3. **Admin Review**: Admins review applications in the admin panel
4. **Role Assignment**: Approved users get vendor role, rejected users remain students

### Authentication Flow
1. **Login**: Users login with email/password (no role selection)
2. **Role Detection**: Backend determines user role from database
3. **Dashboard Redirect**: Users are redirected to appropriate dashboard based on role

## 🎯 Key Components

### VendorApplicationPage
- Comprehensive application form for vendor registration
- Business information collection
- Category selection
- Terms and conditions agreement
- Success confirmation page

### VendorManagement (Admin)
- View all vendor applications
- Filter by status (pending, approved, rejected)
- Detailed application review modal
- Approve/reject functionality with notes
- Application history tracking

### Updated Registration
- Removed role selection dropdown
- Simplified to student-only registration
- Added link to vendor application
- Clear messaging about role assignment

### Updated Login
- Removed role selection
- Backend-determined role assignment
- Automatic redirect based on user role

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### TailwindCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'ucsp-green': {
          400: '#10B981',
          500: '#059669',
          600: '#047857',
        }
      }
    },
  },
  plugins: [],
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📊 Database Schema

### User Management
```sql
-- User roles and profiles
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'vendor', 'admin')),
  student_id VARCHAR(50),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor applications
CREATE TABLE vendor_applications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  business_description TEXT,
  category VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES auth_users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Security Features

- **Role-Based Access Control**: Protected routes based on user roles
- **Form Validation**: Client-side and server-side validation
- **Secure Authentication**: JWT-based authentication (to be implemented)
- **Input Sanitization**: XSS protection through proper input handling

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional design with TailwindCSS
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: ARIA labels and keyboard navigation

## 🔄 State Management

- **Context API**: Global state management for authentication
- **Local State**: Component-level state for forms and UI
- **Persistent Storage**: LocalStorage for user session

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for tablets
- **Desktop Experience**: Enhanced features for desktop users

## 🚀 Future Enhancements

### Phase 2 Features
- **Product Management**: Vendors can add/manage products
- **Shopping Cart**: Complete e-commerce functionality
- **Payment Integration**: Stripe or similar payment processing
- **Real-time Notifications**: WebSocket-based notifications
- **Analytics Dashboard**: Advanced reporting and analytics
- **Review System**: Customer feedback and ratings
- **Order Management**: Complete order lifecycle management

### Technical Improvements
- **API Integration**: Connect to Django backend
- **Real-time Updates**: WebSocket implementation
- **Advanced Search**: Elasticsearch integration
- **Image Upload**: Cloud storage for business images
- **PWA Support**: Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request



For support, email gideonboadu99@gmail.com or create an issue in the repository. 