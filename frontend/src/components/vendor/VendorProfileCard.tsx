import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Calendar
} from 'lucide-react';
import { VendorProfile } from '../../services/vendorProfile';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface VendorProfileCardProps {
  profile: VendorProfile | null;
  isLoading: boolean;
  error: string | null;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export const VendorProfileCard: React.FC<VendorProfileCardProps> = ({
  profile,
  isLoading,
  error,
  onEdit,
  showEditButton = true
}) => {
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading business information..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Business Profile</h3>
          <p className="text-gray-600 mb-4">You haven't created your business profile yet.</p>
          <button
            onClick={onEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with logo and status */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
              {profile.logo && !imageError ? (
                <img
                  src={profile.logo}
                  alt={profile.business_name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Building2 className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.business_name}</h2>
              <p className="text-sm text-white/80 mt-1">
                Owner: {profile.user_full_name || profile.user_username}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                {profile.is_verified ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Verification
                  </span>
                )}
                {profile.is_active ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
          {showEditButton && onEdit && (
            <button
              onClick={onEdit}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              title="Edit Profile"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Business Information */}
      <div className="p-6">
        {/* Description */}
        {profile.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About Us</h3>
            <p className="text-gray-600 leading-relaxed">{profile.description}</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
            
            {profile.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{profile.phone}</p>
                </div>
              </div>
            )}

            {profile.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{profile.email}</p>
                </div>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {profile.website}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Location & Hours</h3>
            
            {profile.address && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900 font-medium">{profile.address}</p>
                </div>
              </div>
            )}

            {profile.business_hours && (
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Business Hours</p>
                  <p className="text-gray-900 font-medium whitespace-pre-line">{profile.business_hours}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Metadata */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
              {profile.updated_at !== profile.created_at && (
                <div className="flex items-center space-x-1">
                  <Edit className="w-4 h-4" />
                  <span>Updated {formatDate(profile.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
