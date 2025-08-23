import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Phone, 
  MapPin, 
  Menu, 
  X, 
  Shield, 
  Zap, 
  Bell, 
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
  Globe,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return undefined;
  }, [showUserDropdown]);

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

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6">
        {/* Top bar with location and contact */}
        <div className="hidden md:flex justify-between items-center py-3 text-sm border-b border-gray-100">
          <div className="flex items-center gap-6">
            {user?.userType === 'vendor' ? (
              <>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Shield className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="font-medium">Vendor Dashboard • Manage Your Business</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Track Performance & Analytics</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="font-medium">Campus • Free delivery on orders over ₵50</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Fast & Reliable Service</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Phone className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="font-medium">+233 53 649 0900</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="h-4 w-4 text-indigo-500" />
              <span>24/7 Support</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          {user?.userType === 'vendor' ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  UCSP
                </h1>
                <p className="text-sm text-gray-500 font-medium">Campus Hub</p>
              </div>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  UCSP
                </h1>
                <p className="text-sm text-gray-500 font-medium">Campus Hub</p>
              </div>
            </Link>
          )}

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative hidden md:block">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Search className="h-3 w-3 text-white" />
              </div>
              <input
                type="text"
                placeholder={user?.userType === 'vendor' ? "Search orders, customers, products..." : "Search for services, vendors, products..."}
                className="pl-12 pr-6 py-4 w-full rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-gray-50 hover:bg-white transition-all duration-300 text-gray-700 placeholder:text-gray-400 font-medium shadow-sm hover:shadow-md"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </div>
            
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {user?.userType !== 'vendor' && (
              <Link
                to="/"
                className={`relative px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive('/') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Home
                {isActive('/') && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                )}
              </Link>
            )}
            <Link
              to="/services"
              className={`relative px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                isActive('/services') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Services
              {isActive('/services') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              )}
            </Link>
            {user?.userType !== 'vendor' && (
              <Link
                to="/vendors"
                className={`relative px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive('/vendors') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Vendors
                {isActive('/vendors') && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                )}
              </Link>
            )}
            {user?.userType !== 'vendor' && (
              <Link
                to="/about"
                className={`relative px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive('/about') 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                About
                {isActive('/about') && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                )}
              </Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-3 rounded-2xl hover:bg-gray-100 transition-all duration-300 group">
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                {user?.userType === 'vendor' ? '5' : '3'}
              </span>
            </button>

            {/* Cart - Hidden for vendors */}
            {user?.userType !== 'vendor' && (
              <button className="relative p-3 rounded-2xl hover:bg-gray-100 transition-all duration-300 group">
                <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  0
                </span>
              </button>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-100 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt=""
                        aria-label={`${user.firstName || ''} ${user.lastName || ''} profile picture`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user.userType}</p>
                  </div>
                  <ChevronDown className={`hidden md:block w-4 h-4 text-gray-500 transition-transform duration-300 ${showUserDropdown ? 'rotate-180' : ''}`} />
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
                          onClick={() => {
                            handleLogout();
                            setShowUserDropdown(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 rounded-xl transition-colors text-red-600"
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
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-2xl hover:bg-gray-100 transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-6 bg-gradient-to-br from-gray-50 to-white">
            {/* Mobile Search */}
            <div className="px-6 mb-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Search className="h-3 w-3 text-white" />
                </div>
                <input
                  type="text"
                  placeholder={user?.userType === 'vendor' ? "Search orders..." : "Search..."}
                  className="pl-12 pr-6 py-4 w-full rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white text-gray-700 placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            <div className="px-6 space-y-3">
              {user?.userType !== 'vendor' && (
                <Link
                  to="/"
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive('/') 
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="font-semibold">Home</span>
                </Link>
              )}
              <Link
                to="/services"
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive('/services') 
                    ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="font-semibold">Services</span>
              </Link>
              {user?.userType !== 'vendor' && (
                <Link
                  to="/vendors"
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive('/vendors') 
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="font-semibold">Vendors</span>
                </Link>
              )}
              {user?.userType !== 'vendor' && (
                <Link
                  to="/about"
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive('/about') 
                      ? 'bg-blue-50 text-blue-600 border-2 border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="font-semibold">About</span>
                </Link>
              )}

              {user ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-2xl mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt=""
                          aria-label={`${user.firstName || ''} ${user.lastName || ''} profile picture`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{user.userType}</p>
                    </div>
                  </div>
                  
                  <Link
                    to={user.userType === 'admin' ? '/admin/dashboard' : '/dashboard'}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-semibold">Dashboard</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="font-semibold">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-center shadow-md"
                    onClick={() => setMobileMenuOpen(false)}
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
  );
}; 