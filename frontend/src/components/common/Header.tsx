import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Shield, 
  Zap, 
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
  Globe,
  MessageCircle,
  HelpCircle,
  Package,
  Bot,
  Menu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAIChatbot } from '../../contexts/AIChatbotContext';
import { MobileNavigation } from './MobileNavigation';
import { ThemeSelector } from './ThemeSelector';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Safely get AI chatbot context with fallback
  let toggleChatbot: (() => void) | undefined;
  try {
    const aiContext = useAIChatbot();
    toggleChatbot = aiContext.toggleChatbot;
  } catch (error) {
    // Context not available, AI chatbot will be disabled
    console.warn('AIChatbot context not available in Header');
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const helpDropdownRef = useRef<HTMLDivElement>(null);


  // Scroll detection for header shrinking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target as Node)) {
        setShowHelpDropdown(false);
      }
    };

    if (showUserDropdown || showHelpDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return undefined;
  }, [showUserDropdown, showHelpDropdown]);

  const searchSuggestions = user?.userType === 'vendor' 
    ? [
        "orders", "customers", "products", "inventory", "delivery", 
        "payments", "reviews", "analytics", "schedule"
      ]
    : [
        "food", "groceries", "barber", "salon", "laundry", "printing", 
        "academic", "transport", "health", "entertainment"
      ];

  const filteredSuggestions = searchSuggestions.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleLogout = (event?: React.MouseEvent | React.TouchEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Header: Logout button clicked');
    try {
      // Close any open dropdowns
      setShowUserDropdown(false);
      setShowHelpDropdown(false);
      
      // Add a small delay to ensure UI updates
      setTimeout(() => {
        logout();
        console.log('Header: Logout successful');
      }, 100);
    } catch (error) {
      console.error('Header: Logout error:', error);
      // Force logout even if there's an error
      window.location.href = '/login';
    }
  };

  return (
    <div>
      {/* Banner - Scrollable */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2">
      <div className="container mx-auto px-6">
          <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Free delivery on campus</span>
                  </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-300" />
                  <span>Fast & Reliable Service</span>
                </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="font-medium">+233 53 649 0900</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>24/7 Support</span>
            </div>
            </div>
          </div>
          </div>
        </div>

      {/* Main Header - Sticky */}
      <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 border-b border-gray-200 shadow-sm transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-6'
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${
              isScrolled ? 'w-10 h-10' : 'w-12 h-12'
            }`}>
              <Shield className={`text-white transition-all duration-300 ${
                isScrolled ? 'w-5 h-5' : 'w-6 h-6'
              }`} />
            </div>
            <div className={`transition-all duration-300 ${isScrolled ? 'hidden md:block' : 'block'}`}>
              <h1 className={`font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 ${
                isScrolled ? 'text-xl' : 'text-2xl'
              }`}>
                  UCSP
                </h1>
              <p className={`text-gray-500 font-medium transition-all duration-300 ${
                isScrolled ? 'text-xs' : 'text-sm'
              }`}>Campus Hub</p>
              </div>
            </Link>

          {/* Search Form - Hidden on mobile */}
          <div className={`flex-1 max-w-2xl mx-4 lg:mx-8 relative transition-all duration-300 ${
            isScrolled ? 'hidden lg:block' : 'hidden md:block'
          }`}>
            <form className="relative flex gap-2">
              <div className="relative flex-1">
                <label htmlFor="search-input" className="sr-only">
                  Search for services, vendors, and products
                </label>
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isScrolled ? 'w-4 h-4' : 'w-5 h-5'
                }`}>
                  <Search className={`text-white transition-all duration-300 ${
                    isScrolled ? 'h-2.5 w-2.5' : 'h-3 w-3'
                  }`} />
              </div>
              <input
                id="search-input"
                name="search"
                type="text"
                placeholder="Search for services, vendors, products..."
                className={`pl-12 pr-6 w-full rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 placeholder:text-gray-400 font-medium shadow-sm hover:shadow-md ${
                  isScrolled ? 'py-3 text-sm' : 'py-4'
                }`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                aria-label="Search for services, vendors, and products"
              />
            </div>
              <button
                type="submit"
                className={`px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                  isScrolled ? 'py-3 text-sm' : 'py-4'
                }`}
              >
                Find
              </button>
            </form>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-2xl shadow-xl mt-2 z-50 overflow-hidden">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-6 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium transition-colors border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Search className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-gray-700">{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Selector */}
            <ThemeSelector />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
              title="Menu"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Desktop Controls */}
          <div className={`hidden md:flex items-center gap-4 transition-all duration-300 ${
            isScrolled ? 'gap-2' : 'gap-4'
          }`}>
            {/* Theme Selector */}
            <ThemeSelector />
            {/* AI Assistant Button - Only for Students */}
            {user?.userType === 'student' && toggleChatbot && (
              <button
                onClick={toggleChatbot}
                className={`flex items-center gap-2 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group ${
                  isScrolled ? 'px-3 py-2' : 'px-4 py-2'
                }`}
                title="AI Assistant"
              >
                <Bot className={`text-blue-600 group-hover:text-blue-700 transition-all duration-300 ${
                  isScrolled ? 'h-4 w-4' : 'h-5 w-5'
                }`} />
                <span className={`font-semibold text-gray-700 group-hover:text-blue-700 transition-all duration-300 ${
                  isScrolled ? 'hidden lg:block text-xs' : 'hidden md:block text-sm'
                }`}>AI Assistant</span>
              </button>
            )}

            {/* Help Dropdown */}
            <div className="relative" ref={helpDropdownRef}>
              <button
                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                className={`flex items-center gap-2 rounded-2xl hover:bg-gray-100 transition-all duration-300 group ${
                  isScrolled ? 'px-3 py-2' : 'px-4 py-2'
                }`}
              >
                <HelpCircle className={`text-gray-600 group-hover:text-blue-600 transition-all duration-300 ${
                  isScrolled ? 'h-4 w-4' : 'h-5 w-5'
                }`} />
                <span className={`font-semibold text-gray-700 transition-all duration-300 ${
                  isScrolled ? 'hidden lg:block text-xs' : 'hidden md:block text-sm'
                }`}>Help</span>
                <ChevronDown className={`text-gray-500 transition-transform duration-300 ${
                  showHelpDropdown ? 'rotate-180' : ''
                } ${isScrolled ? 'w-3 h-3' : 'w-4 h-4'}`} />
              </button>

              {/* Help Dropdown Menu */}
              {showHelpDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-2">
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-blue-50 rounded-xl transition-colors">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-700">Chatbot</span>
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-green-50 rounded-xl transition-colors">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-700">WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center gap-3 rounded-2xl hover:bg-gray-100 transition-all duration-300 group ${
                    isScrolled ? 'p-1.5' : 'p-2'
                  }`}
                >
                  <div className={`bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isScrolled ? 'w-8 h-8' : 'w-10 h-10'
                  }`}>
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt=""
                        aria-label={`${user.firstName || ''} ${user.lastName || ''} profile picture`}
                        className={`rounded-full object-cover transition-all duration-300 ${
                          isScrolled ? 'w-8 h-8' : 'w-10 h-10'
                        }`}
                      />
                    ) : (
                      <User className={`text-white transition-all duration-300 ${
                        isScrolled ? 'w-5 h-5' : 'w-6 h-6'
                      }`} />
                    )}
                  </div>
                  <div className={`text-left transition-all duration-300 ${
                    isScrolled ? 'hidden lg:block' : 'hidden md:block'
                  }`}>
                    <p className={`font-semibold text-gray-900 transition-all duration-300 ${
                      isScrolled ? 'text-xs' : 'text-sm'
                    }`}>Account</p>
                  </div>
                  <ChevronDown className={`text-gray-500 transition-transform duration-300 ${
                    showUserDropdown ? 'rotate-180' : ''
                  } ${isScrolled ? 'hidden lg:block w-3 h-3' : 'hidden md:block w-4 h-4'}`} />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt=""
                              aria-label={`${user.firstName || ''} ${user.lastName || ''} profile picture`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <UserCircle className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1 capitalize">
                            {user.userType}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link
                        to={user.userType === 'admin' ? '/admin/dashboard' : '/dashboard'}
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-700">Dashboard</span>
                      </Link>
                      
                <Link
                        to="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Settings className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700">Profile Settings</span>
                </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                          onClick={handleLogout}
                          onTouchEnd={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-4 text-left hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors text-red-600 touch-manipulation min-h-[48px]"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <LogOut className="h-4 w-4 text-red-600" />
                          </div>
                          <span className="font-medium">Sign Out</span>
                </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex items-center gap-3 transition-all duration-300 ${
                isScrolled ? 'gap-2' : 'gap-3'
              }`}>
                <Link
                  to="/login"
                  className={`flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors ${
                    isScrolled ? 'hidden lg:flex px-3 py-2 text-xs' : 'hidden md:flex px-4 py-2 text-sm'
                  }`}
                >
                  <User className={`transition-all duration-300 ${
                    isScrolled ? 'h-3 w-3' : 'h-4 w-4'
                  }`} />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                    isScrolled ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showUserDropdown && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500 capitalize">{user.userType}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <User className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/services"
                      className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Package className="h-5 w-5" />
                      Services
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Mobile Navigation */}
    <MobileNavigation
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
      user={user ? {
        name: user.username,
        email: user.email,
        userType: user.userType as 'student' | 'vendor' | 'admin'
      } : undefined}
      onNavigate={(path) => {
        // Handle navigation
        window.location.href = path;
      }}
      onLogout={handleLogout}
    />
    </div>
  );
}; 