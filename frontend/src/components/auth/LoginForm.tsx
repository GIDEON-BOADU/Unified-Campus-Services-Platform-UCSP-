import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Shield, 
  ArrowRight, 
  Star,
  Users,
  CheckCircle,
  Sparkles,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';


export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim()) {
      setError('Please enter your username or email.');
      return;
    }
    if (!formData.password.trim()) {
      setError('Please enter your password.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('LoginForm: Attempting login with:', formData.username);
      const result = await login(formData.username, formData.password);
      
      console.log('LoginForm: Login result:', result);
      
      if (result) {
        console.log('LoginForm: Login successful, user should be redirected');
        // Clear form on successful login
        setFormData({
          username: '',
          password: '',
          rememberMe: false,
        });
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      // Redirect will be handled in useEffect
    } catch (error) {
      console.error('LoginForm: Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect after login based on user type
  useEffect(() => {
    console.log('LoginForm useEffect - user:', user, 'isAuthenticated:', isAuthenticated);
          if (user && isAuthenticated && user.id) {
        console.log('Redirecting user:', user.userType, 'User object:', user);
        console.log('User properties:', Object.keys(user));
        console.log('User type value:', user.userType, 'User type property:', (user as any).user_type);
        
        // Check both userType and user_type properties
        const userType = user.userType || user.user_type;
        
        console.log('Final userType for navigation:', userType);
        
        if (userType === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userType === 'student') {
          navigate('/services', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
  }, [user?.id, isAuthenticated, navigate]); // Only depend on user.id, not the entire user object

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-ucsp-green-500/10 via-transparent to-blue-500/10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-ucsp-green-400/20 to-ucsp-green-600/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl animate-pulse delay-2000"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Visual Elements */}
          <div className="hidden lg:block space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                <LogIn className="w-4 h-4" />
                Welcome Back!
                <Star className="w-4 h-4 fill-current text-yellow-500" />
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Ready to
                <span className="block text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text">
                  Continue?
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Access your campus services, manage your bookings, and stay connected with the UCSP community.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Access</h3>
                  <p className="text-sm text-gray-600">Get back to your services instantly</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-ucsp-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-ucsp-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Your Dashboard</h3>
                  <p className="text-sm text-gray-600">Manage bookings and preferences</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Fast</h3>
                  <p className="text-sm text-gray-600">Your data is always protected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:max-w-lg">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      UCSP
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">Campus Hub</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
                <p className="text-gray-600">Sign in to continue your journey</p>
              </div>
              
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
        
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 placeholder:text-gray-400 font-medium shadow-sm hover:shadow-md"
                        placeholder="Enter your email or username"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 placeholder:text-gray-400 font-medium shadow-sm hover:shadow-md"
                        placeholder="Enter your password"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="rememberMe" className="text-sm font-medium text-gray-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center items-center gap-3 py-4 px-6 border border-transparent text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Sign up
                    </Link>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 