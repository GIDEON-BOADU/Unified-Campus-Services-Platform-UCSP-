# UCSP - University Campus Service Platform

A full-stack web application for managing campus services including printing, bookings, and payments.

## Project Structure

```
UCSP/
├── UI/                 # React Frontend (TypeScript + Vite)
├── bookings/          # Django app for booking management
├── payments/          # Django app for payment processing
├── services/          # Django app for service management
├── users/             # Django app for user management
└── UCSP_PRJ/         # Django project settings
```

## Setup Instructions

### Backend (Django)

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

3. **Create a superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

4. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```
   The backend will be available at `http://localhost:8000`

### Frontend (React)

1. **Navigate to the UI directory:**
   ```bash
   cd UI
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `GET /api/users/profile/` - Get user profile
- `PATCH /api/users/profile/update/` - Update user profile

### Services
- `GET /api/services/` - List all services
- `GET /api/services/{id}/` - Get specific service
- `POST /api/services/` - Create new service

### Bookings
- `GET /api/bookings/` - List user bookings
- `POST /api/bookings/` - Create new booking

### Payments
- `GET /api/payments/` - List user payments
- `POST /api/payments/create/` - Create new payment

## Features

### User Types
- **Students**: Can book services, make payments, view their history
- **Business Owners**: Can manage services, view bookings, process payments
- **Administrators**: Can manage users, services, and system settings

### Key Features
- JWT-based authentication
- Role-based access control
- Service booking system
- Payment integration (Paystack)
- Real-time notifications
- Responsive design

## Development

### Frontend Development
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management

### Backend Development
- Django 5.2 with REST Framework
- SQLite database (can be changed to PostgreSQL for production)
- JWT authentication
- CORS enabled for frontend communication

## Connecting Frontend to Backend

The frontend and backend are now connected through:

1. **CORS Configuration**: Django backend allows requests from `http://localhost:3000`
2. **API Service Layer**: Frontend uses a centralized API service (`src/services/api.ts`)
3. **Proxy Configuration**: Vite development server proxies `/api` requests to Django
4. **JWT Authentication**: Tokens are stored in localStorage and sent with requests

### Testing the Connection

1. Start both servers (Django on port 8000, React on port 3000)
2. Navigate to `http://localhost:3000`
3. Try to register a new user or login with existing credentials
4. Check the browser's Network tab to see API requests

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure Django server is running and CORS is properly configured
2. **API Connection**: Verify both servers are running on correct ports
3. **Authentication**: Check that JWT tokens are being sent with requests
4. **Database**: Run migrations if you get database-related errors

### Debug Mode

- Frontend: Check browser console for errors
- Backend: Check Django server logs for API errors
- Network: Use browser's Network tab to inspect API requests

## Production Deployment

For production deployment:

1. **Backend**: Use a production WSGI server (Gunicorn) with a proper database (PostgreSQL)
2. **Frontend**: Build the React app (`npm run build`) and serve static files
3. **Environment Variables**: Set proper environment variables for production
4. **Security**: Configure HTTPS, proper CORS settings, and security headers 