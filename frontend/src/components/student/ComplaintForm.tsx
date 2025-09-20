import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Send, 
  X, 
  FileText, 
  ShoppingCart, 
  Calendar, 
  CreditCard, 
  User, 
  Globe, 
  HelpCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { complaintService } from '../../services/complaints';
import { CreateComplaintData } from '../../types';

interface ComplaintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  relatedService?: string;
  relatedOrder?: string;
  relatedBooking?: string;
}

const COMPLAINT_TYPES = [
  { value: 'service', label: 'Service Issue', icon: FileText, description: 'Problem with a service' },
  { value: 'order', label: 'Order Problem', icon: ShoppingCart, description: 'Issue with an order' },
  { value: 'booking', label: 'Booking Issue', icon: Calendar, description: 'Problem with a booking' },
  { value: 'payment', label: 'Payment Problem', icon: CreditCard, description: 'Payment related issue' },
  { value: 'vendor', label: 'Vendor Behavior', icon: User, description: 'Issue with vendor conduct' },
  { value: 'platform', label: 'Platform Issue', icon: Globe, description: 'Technical or platform problem' },
  { value: 'other', label: 'Other', icon: HelpCircle, description: 'Other issues' },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'high', label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' },
];

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  relatedService,
  relatedOrder,
  relatedBooking
}) => {
  const [formData, setFormData] = useState<CreateComplaintData>({
    complaint_type: 'other',
    subject: '',
    description: '',
    priority: 'medium',
    ...(relatedService && { related_service: relatedService }),
    ...(relatedOrder && { related_order: relatedOrder }),
    ...(relatedBooking && { related_booking: relatedBooking })
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await complaintService.createComplaint(formData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        complaint_type: 'other',
        subject: '',
        description: '',
        priority: 'medium',
        ...(relatedService && { related_service: relatedService }),
        ...(relatedOrder && { related_order: relatedOrder }),
        ...(relatedBooking && { related_booking: relatedBooking })
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Auto-close after success
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateComplaintData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">File a Complaint</h2>
              <p className="text-sm text-gray-600">Report an issue or problem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Complaint Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Complaint Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMPLAINT_TYPES.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('complaint_type', type.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.complaint_type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${
                        formData.complaint_type === type.value ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-xs text-gray-600">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Priority Level *
            </label>
            <div className="flex gap-3">
              {PRIORITY_LEVELS.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleChange('priority', priority.value)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                    formData.priority === priority.value
                      ? 'border-current bg-opacity-20'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${priority.bgColor} ${priority.color}`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.subject.length}/200 characters
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Please provide detailed information about the issue..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Related Entities Info */}
          {(relatedService || relatedOrder || relatedBooking) && (
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">Related to:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                {relatedService && <div>• Service: {relatedService}</div>}
                {relatedOrder && <div>• Order: {relatedOrder}</div>}
                {relatedBooking && <div>• Booking: {relatedBooking}</div>}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Complaint submitted successfully! We'll review it soon.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
