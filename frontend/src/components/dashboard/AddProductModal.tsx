import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, MapPin, MessageCircle, Clock, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useServices, CreateServiceData } from '../../hooks/useServices';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

interface ProductFormData {
  service_name: string;
  description: string;
  category: string;
  service_type: string;
  base_price: string;
  has_flexible_pricing: boolean;
  is_available: boolean;
  availability_status: string;
  contact_info: string;
  location: string;
  can_book: boolean;
  can_order: boolean;
  can_walk_in: boolean;
  requires_contact: boolean;
}

const CATEGORY_CHOICES = [
  { value: 'food', label: 'Food & Beverages' },
  { value: 'beauty', label: 'Beauty & Grooming' },
  { value: 'printing', label: 'Printing & Copying' },
  { value: 'laundry', label: 'Laundry Services' },
  { value: 'academic', label: 'Academic Services' },
  { value: 'transport', label: 'Transportation' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other Services' }
];

const SERVICE_TYPE_CHOICES = [
  { value: 'booking', label: 'Booking Required' },
  { value: 'ordering', label: 'Ordering System' },
  { value: 'contact', label: 'Contact Directly' },
  { value: 'walk_in', label: 'Walk-in Service' }
];

const AVAILABILITY_CHOICES = [
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy/High Demand' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'closed', label: 'Closed' }
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded
}) => {
  const { user } = useAuth();
  const { createService } = useServices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    service_name: '',
    description: '',
    category: '',
    service_type: '',
    base_price: '',
    has_flexible_pricing: false,
    is_available: true,
    availability_status: 'available',
    contact_info: '',
    location: '',
    can_book: false,
    can_order: false,
    can_walk_in: false,
    requires_contact: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Auto-set capability fields based on service type
  React.useEffect(() => {
    if (formData.service_type) {
      setFormData(prev => ({
        ...prev,
        can_book: formData.service_type === 'booking',
        can_order: formData.service_type === 'ordering',
        can_walk_in: formData.service_type === 'walk_in',
        requires_contact: formData.service_type === 'contact'
      }));
    }
  }, [formData.service_type]);

  const handleCheckboxChange = (name: keyof ProductFormData) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
    // Clear error when user makes changes
    if (error) setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear error when image is selected
      if (error) setError(null);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (error) setError(null);
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      description: '',
      category: '',
      service_type: '',
      base_price: '',
      has_flexible_pricing: false,
      is_available: true,
      availability_status: 'available',
      contact_info: '',
      location: '',
      can_book: false,
      can_order: false,
      can_walk_in: false,
      requires_contact: false
    });
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, starting service creation...');
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.service_name.trim()) {
        throw new Error('Service name is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      
      if (!formData.category) {
        throw new Error('Category is required');
      }
      
      if (!formData.service_type) {
        throw new Error('Service type is required');
      }

      const serviceData: CreateServiceData = {
        ...formData,
        base_price: formData.base_price ? parseFloat(formData.base_price) : undefined,
        image: selectedImage
      };

      console.log('Calling createService with data:', serviceData);
      const newService = await createService(serviceData);
      console.log('createService returned:', newService);
      
      if (newService) {
        console.log('Service created successfully:', newService);
        
        // Reset form and close modal
        resetForm();
        onProductAdded();
        onClose();
      } else {
        throw new Error('Service creation failed - no response received');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service';
      setError(errorMessage);
    } finally {
      console.log('Form submission finally block - setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Product/Service</h2>
              <p className="text-gray-600">Create a new offering for your customers</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="service-name" className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                id="service-name"
                type="text"
                name="service_name"
                value={formData.service_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                placeholder="e.g., Espresso, Haircut, Printing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 focus:bg-white transition-all duration-200"
              >
                <option value="">Select Category</option>
                {CATEGORY_CHOICES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
              placeholder="Describe your service in detail..."
            />
          </div>

          {/* Service Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Image
            </label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2 font-medium">Upload a service image</p>
                  <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="service-image"
                  />
                  <label
                    htmlFor="service-image"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Choose Image
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Service Type and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type *
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 focus:bg-white transition-all duration-200"
              >
                <option value="">Select Service Type</option>
                {SERVICE_TYPE_CHOICES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (GHS)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Service Capabilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Capabilities
            </label>
            <p className="text-sm text-gray-600 mb-4">
              These capabilities are automatically set based on your service type. You can manually adjust them if needed.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className={`flex items-center gap-2 ${formData.service_type === 'booking' ? 'cursor-default' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={formData.can_book}
                  onChange={() => handleCheckboxChange('can_book')}
                  disabled={formData.service_type === 'booking'}
                  className={`w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 checked:bg-purple-600 transition-all duration-200 ${formData.service_type === 'booking' ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <span className={`text-sm ${formData.service_type === 'booking' ? 'text-gray-500' : 'text-gray-700'}`}>
                  Booking {formData.service_type === 'booking' && '(Auto-enabled)'}
                </span>
              </label>
              <label className={`flex items-center gap-2 ${formData.service_type === 'ordering' ? 'cursor-default' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={formData.can_order}
                  onChange={() => handleCheckboxChange('can_order')}
                  disabled={formData.service_type === 'ordering'}
                  className={`w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 checked:bg-purple-600 transition-all duration-200 ${formData.service_type === 'ordering' ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <span className={`text-sm ${formData.service_type === 'ordering' ? 'text-gray-500' : 'text-gray-700'}`}>
                  Ordering {formData.service_type === 'ordering' && '(Auto-enabled)'}
                </span>
              </label>
              <label className={`flex items-center gap-2 ${formData.service_type === 'walk_in' ? 'cursor-default' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={formData.can_walk_in}
                  onChange={() => handleCheckboxChange('can_walk_in')}
                  disabled={formData.service_type === 'walk_in'}
                  className={`w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 checked:bg-purple-600 transition-all duration-200 ${formData.service_type === 'walk_in' ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <span className={`text-sm ${formData.service_type === 'walk_in' ? 'text-gray-500' : 'text-gray-700'}`}>
                  Walk-in {formData.service_type === 'walk_in' && '(Auto-enabled)'}
                </span>
              </label>
              <label className={`flex items-center gap-2 ${formData.service_type === 'contact' ? 'cursor-default' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={formData.requires_contact}
                  onChange={() => handleCheckboxChange('requires_contact')}
                  disabled={formData.service_type === 'contact'}
                  className={`w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 checked:bg-purple-600 transition-all duration-200 ${formData.service_type === 'contact' ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <span className={`text-sm ${formData.service_type === 'contact' ? 'text-gray-500' : 'text-gray-700'}`}>
                  Contact {formData.service_type === 'contact' && '(Auto-enabled)'}
                </span>
              </label>
            </div>
          </div>

          {/* Contact and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                  placeholder="WhatsApp, phone, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location/Delivery Area
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
                  placeholder="Campus location or delivery area"
                />
              </div>
            </div>
          </div>

          {/* Availability Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability Status
              </label>
              <select
                name="availability_status"
                value={formData.availability_status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-900 focus:bg-white transition-all duration-200"
              >
                {AVAILABILITY_CHOICES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={() => handleCheckboxChange('is_available')}
                  className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 checked:bg-purple-600 transition-all duration-200"
                />
                <span className="text-sm text-gray-700">Service is currently available</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Create Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
