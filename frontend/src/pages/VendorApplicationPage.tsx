import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
// Note: Vendor application service will be implemented in future version

export const VendorApplicationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    experience: '',
    reason: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Frontend validation
    if (formData.businessName.trim().length < 3) {
      setError('Business name must be at least 3 characters long.');
      setIsSubmitting(false);
      return;
    }
    
    if (formData.businessDescription.trim().length < 10) {
      setError('Business description must be at least 10 characters long.');
      setIsSubmitting(false);
      return;
    }
    
    if (formData.address.trim().length < 5) {
      setError('Business address must be at least 5 characters long.');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.category) {
      setError('Please select a business category.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // MVP: Simulate submission for now
      // In future version, this will connect to the vendor application service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in becoming a vendor. We've received your application and will review it within 3-5 business days. You'll receive an email notification once your application has been processed.
            </p>
            <div className="space-y-3">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-base font-semibold text-blue-700 hover:text-white hover:bg-blue-700 transition-colors duration-200 px-4 py-2 rounded-lg shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{ boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}
          >
            <span className="flex items-center justify-center bg-blue-100 hover:bg-blue-600 rounded-full p-1 transition-colors duration-200">
              <ArrowLeft className="h-5 w-5 text-blue-700 hover:text-white" />
            </span>
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl font-bold text-blue-700 mb-2">Become a Vendor</h1>
          <p className="text-blue-600">
            Join our platform and start serving the campus community. Fill out the form below to apply.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-md">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Information */}
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-700" />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-blue-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your business name (minimum 3 characters)"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-blue-700 mb-1">
                    Business Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    <option value="food">Food & Beverages</option>
                    <option value="beauty">Beauty & Grooming</option>
                    <option value="printing">Printing & Copying</option>
                    <option value="laundry">Laundry Services</option>
                    <option value="academic">Academic Services</option>
                    <option value="transport">Transportation</option>
                    <option value="health">Health & Wellness</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other Services</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="businessDescription" className="block text-sm font-medium text-blue-700 mb-1">
                  Business Description *
                </label>
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  required
                  rows={4}
                  value={formData.businessDescription}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your business, services, and what makes you unique... (minimum 10 characters)"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-700" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-blue-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="website" className="block text-sm font-medium text-blue-700 mb-1">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-700" />
                Location
              </h3>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-blue-700 mb-1">
                  Business Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your business address... (minimum 5 characters)"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-700" />
                Additional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-blue-700 mb-1">
                    Business Experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows={3}
                    value={formData.experience}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about your business experience and background..."
                  />
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-blue-700 mb-1">
                    Why do you want to join our platform?
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleChange}
                    className="block w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your motivation for joining our campus platform..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-base font-semibold text-blue-700 hover:text-white hover:bg-blue-700 transition-colors duration-200 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{ boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}
              >
                <span className="flex items-center justify-center bg-blue-100 hover:bg-blue-600 rounded-full p-1 transition-colors duration-200">
                  {/* Optionally add an icon here for visual consistency, e.g. <ArrowLeft className="h-4 w-4 text-blue-700 hover:text-white" /> */}
                </span>
                <span>Cancel</span>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg shadow-lg hover:from-blue-800 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-bold text-lg transition-all duration-200"
                style={{ boxShadow: '0 4px 16px rgba(37,99,235,0.12)' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}; 