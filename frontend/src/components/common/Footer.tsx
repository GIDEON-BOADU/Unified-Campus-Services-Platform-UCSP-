import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Smartphone, 
  Heart,
  Shield,
  Users,
  ArrowUp,
  BookOpen,
  HelpCircle
} from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    UCSP
                  </h3>
                  <p className="text-sm text-gray-400">Campus Hub</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Campus premier marketplace connecting you with quality products and professional services from trusted local providers. Building a vibrant campus community.
              </p>
              
              {/* Social Media */}
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  <Facebook className="h-4 w-4" />
                </button>
                <button className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center hover:from-sky-600 hover:to-sky-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  <Twitter className="h-4 w-4" />
                </button>
                <button className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  <Instagram className="h-4 w-4" />
                </button>
                <button className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                    About UCSP
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                    Browse Services
                  </Link>
                </li>
                <li>
                  <Link to="/vendor-application" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                    Become a Vendor
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-green-400" />
                Support & Contact
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-colors duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white font-medium">+233 53 649 0900</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-colors duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-medium">support@ucsp.edu.gh</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-colors duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="text-white font-medium">University Campus, Ghana</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium">
                  Live Chat Support
                </button>
              </div>
            </div>

            {/* Newsletter & App */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Stay Updated
              </h4>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Get notified about new campus services, vendor updates, and exclusive student offers.
              </p>
              
              {/* Newsletter Subscription */}
              <div className="space-y-3 mb-6">
                <input 
                  id="newsletter-email"
                  name="newsletter_email"
                  type="email"
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  aria-label="Enter your email for newsletter subscription"
                />
                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium">
                  Subscribe
                </button>
              </div>
              
              {/* App Download */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-white">Mobile Access</p>
                <div className="space-y-2">
                  <button className="w-full px-4 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-400 transition-all duration-300 flex items-center justify-center gap-2 group">
                    <Smartphone className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Mobile App (Coming Soon)</span>
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Currently optimized for mobile browsers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left">
                <p className="text-gray-400 text-sm mb-2">
                  © 2024 UCSP. All rights reserved.
                </p>
                <p className="text-gray-500 text-xs flex items-center justify-center lg:justify-start gap-1">
                  Made with <Heart className="w-3 h-3 text-red-500" /> by 
                  <span className="text-blue-400 font-medium">Codestr8</span> and team, 
                  <span className="text-green-400 font-medium"> the three chefs at work!</span>
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/help" className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center gap-1">
                  <span>Help Center</span>
                </Link>
                <Link to="/faq" className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center gap-1">
                  <span>FAQ</span>
                </Link>
                <Link to="/contact" className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300 flex items-center gap-1">
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-110 z-40 flex items-center justify-center"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}; 