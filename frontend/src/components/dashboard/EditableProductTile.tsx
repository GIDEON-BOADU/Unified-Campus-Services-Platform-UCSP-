import React, { useState } from 'react';
import { Edit, Save, X, Trash2, Image as ImageIcon, Star, Eye, AlertCircle } from 'lucide-react';
import { Service } from '../../hooks/useServices';

interface EditableProductTileProps {
  service: Service;
  onUpdate: (serviceId: string, updatedData: Partial<Service>) => Promise<void>;
  onDelete: (serviceId: string) => Promise<void>;
  onView: (service: Service) => void;
}

export const EditableProductTile: React.FC<EditableProductTileProps> = ({
  service,
  onUpdate,
  onDelete,
  onView
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    service_name: service.service_name,
    description: service.description,
    category: service.category,
    service_type: service.service_type,
    base_price: service.base_price || '',
    is_available: service.is_available,
    availability_status: service.availability_status,
    contact_info: service.contact_info || '',
    location: service.location || '',
    supports_booking: service.can_book || false,
    supports_ordering: service.can_order || false,
    supports_walk_in: service.can_walk_in || false,
    requires_contact: service.requires_contact || false
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(service.images || null);

  const handleSave = async () => {
    // Basic validation
    if (!editData.service_name.trim() || !editData.description.trim()) {
      setError('Service name and description are required');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const updateData: any = {
        ...editData,
        base_price: editData.base_price ? parseFloat(editData.base_price.toString()) : null
      };
      
      // Add image if a new one was selected
      if (selectedImage) {
        updateData.image = selectedImage;
      }
      
      await onUpdate(service.id, updateData);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error('Failed to update service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  const handleCancel = () => {
    setEditData({
      service_name: service.service_name,
      description: service.description,
      category: service.category,
      service_type: service.service_type,
      base_price: service.base_price || '',
      is_available: service.is_available,
      availability_status: service.availability_status,
      contact_info: service.contact_info || '',
      location: service.location || '',
      supports_booking: service.can_book || false,
      supports_ordering: service.can_order || false,
      supports_walk_in: service.can_walk_in || false,
      requires_contact: service.requires_contact || false
    });
    setSelectedImage(null);
    setImagePreview(service.images || null);
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.service_name}"?\n\nThis action cannot be undone and will remove the service from your dashboard and student view.`
    );
    
    if (confirmed) {
      setIsLoading(true);
      try {
        await onDelete(service.id);
      } catch (error) {
        console.error('Failed to delete service:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  if (isEditing) {
    return (
      <div className="border border-purple-300 rounded-2xl p-6 bg-white shadow-lg">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              value={editData.service_name}
              onChange={(e) => handleInputChange('service_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category and Service Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={editData.category || service.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <select
                value={editData.service_type || service.service_type}
                onChange={(e) => handleInputChange('service_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="booking">Booking Required</option>
                <option value="ordering">Ordering System</option>
                <option value="contact">Contact Directly</option>
                <option value="walk_in">Walk-in Service</option>
              </select>
            </div>
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
                    className="w-full h-32 object-cover rounded-xl border border-gray-300"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove Image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="mt-2 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id={`change-image-${service.id}`}
                    />
                    <label
                      htmlFor={`change-image-${service.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Change Image
                    </label>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 text-sm mb-2">Upload a service image</p>
                  <p className="text-xs text-gray-500 mb-3">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id={`service-image-${service.id}`}
                  />
                  <label
                    htmlFor={`service-image-${service.id}`}
                    className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                  >
                    Choose Image
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Price and Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (GHS)
              </label>
              <input
                type="number"
                value={editData.base_price}
                onChange={(e) => handleInputChange('base_price', e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability Status
              </label>
              <select
                value={editData.availability_status}
                onChange={(e) => handleInputChange('availability_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="busy">Busy/High Demand</option>
                <option value="unavailable">Unavailable</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Contact and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Info
              </label>
              <input
                type="text"
                value={editData.contact_info}
                onChange={(e) => handleInputChange('contact_info', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="WhatsApp, phone, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Campus location or delivery area"
              />
            </div>
          </div>

          {/* Service Capabilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Capabilities
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.supports_booking || false}
                  onChange={(e) => handleInputChange('supports_booking', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Supports Booking</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.supports_ordering || false}
                  onChange={(e) => handleInputChange('supports_ordering', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Supports Ordering</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.supports_walk_in || false}
                  onChange={(e) => handleInputChange('supports_walk_in', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Supports Walk-in</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editData.requires_contact || false}
                  onChange={(e) => handleInputChange('requires_contact', e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Requires Contact</span>
              </label>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`available-${service.id}`}
              checked={editData.is_available}
              onChange={(e) => handleInputChange('is_available', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor={`available-${service.id}`} className="text-sm font-medium text-gray-700">
              Service is currently available
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-md transition-all duration-300 group bg-white">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
          ✓ Service updated successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}
      
      {/* Header with Edit/Delete buttons */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
          {service.service_name}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onView(service)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Edit Service"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete Service"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Service Image */}
      {service.images ? (
        <div className="mb-4">
          <img
            src={service.images}
            alt={service.service_name}
            className="w-full h-32 object-cover rounded-xl"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      ) : (
        <div className="mb-4 w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>

      {/* Price and Category */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold text-gray-900">
          {service.base_price ? `GHS ${service.base_price}` : 'Contact for price'}
        </span>
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <Star className="w-4 h-4" />
          {service.category}
        </span>
      </div>

      {/* Service Capabilities */}
      <div className="flex gap-1 mb-4">
        {service.can_book && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Booking
          </span>
        )}
        {service.can_order && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Ordering
          </span>
        )}
        {service.can_walk_in && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Walk-in
          </span>
        )}
        {service.requires_contact && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Contact
          </span>
        )}
      </div>

      {/* Availability Status */}
      <div className="flex justify-between items-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          service.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {service.is_available ? 'Available' : 'Unavailable'}
        </span>
        
        {/* Rating Display */}
        {service.rating && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{service.rating}</span>
            <span className="text-gray-400">({service.total_ratings})</span>
          </div>
        )}
      </div>
    </div>
  );
};
