import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Printer, 
  AlertCircle,
  Paperclip
} from 'lucide-react';
import { Service } from '../../types';

interface PrintingServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onSuccess?: (message: string) => void;
}

interface PrintRequest {
  service_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  copies: number;
  paper_size: string;
  color_mode: 'color' | 'black_white';
  binding: string;
  special_instructions: string;
  contact_phone: string;
  pickup_location: string;
}

const PrintingServiceModal: React.FC<PrintingServiceModalProps> = ({
  isOpen,
  onClose,
  service,
  onSuccess
}) => {
  const [formData, setFormData] = useState<PrintRequest>({
    service_id: service.id,
    file_name: '',
    file_type: '',
    file_size: 0,
    copies: 1,
    paper_size: 'A4',
    color_mode: 'black_white',
    binding: 'none',
    special_instructions: '',
    contact_phone: '',
    pickup_location: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG)');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      }));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!selectedFile) {
        setError('Please select a file to upload');
        return;
      }

      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('copies', formData.copies.toString());
      uploadData.append('paper_size', formData.paper_size);
      uploadData.append('color_mode', formData.color_mode);
      uploadData.append('special_instructions', formData.special_instructions);
      uploadData.append('contact_phone', formData.contact_phone);
      uploadData.append('pickup_location', formData.pickup_location);

      const response = await fetch(`/api/services/${service.id}/upload-print-file/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const result = await response.json();
      onSuccess?.(`Print request submitted successfully! Request ID: ${result.print_request_id}`);
      onClose();
    } catch (err) {
      console.error('Print request error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit print request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Print Request</h2>
                <p className="text-sm text-gray-600">{service.service_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 text-blue-500 mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFormData(prev => ({
                            ...prev,
                            file_name: '',
                            file_type: '',
                            file_size: 0
                          }));
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Click to upload</p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Print Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="copies" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Copies
                </label>
                <input
                  id="copies"
                  name="copies"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.copies}
                  onChange={(e) => setFormData(prev => ({ ...prev, copies: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paper Size
                </label>
                <select
                  value={formData.paper_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, paper_size: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="A5">A5</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Mode
                </label>
                <select
                  value={formData.color_mode}
                  onChange={(e) => setFormData(prev => ({ ...prev, color_mode: e.target.value as 'color' | 'black_white' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="black_white">Black & White</option>
                  <option value="color">Color</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Binding
                </label>
                <select
                  value={formData.binding}
                  onChange={(e) => setFormData(prev => ({ ...prev, binding: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Binding</option>
                  <option value="stapled">Stapled</option>
                  <option value="spiral">Spiral Bound</option>
                  <option value="perfect">Perfect Bound</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  id="contact-phone"
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="0241234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="pickup-location" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <input
                  id="pickup-location"
                  name="pickup_location"
                  type="text"
                  value={formData.pickup_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickup_location: e.target.value }))}
                  placeholder="Where should we deliver?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                value={formData.special_instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                placeholder="Any specific requirements for your print job..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Service Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-2">Service Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{service.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="font-medium">{service.vendor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{service.location || 'Contact vendor'}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Paperclip className="w-4 h-4" />
                    Submit Print Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default PrintingServiceModal;
