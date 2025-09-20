import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  MessageSquare,
  AlertCircle,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface VendorApplication {
  id: number;
  applicant: number;
  applicant_username: string;
  applicant_email: string;
  applicant_first_name: string;
  applicant_last_name: string;
  business_name: string;
  business_description: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  experience: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  reviewed_by_username: string | null;
}

export const AdminVendorApplications: React.FC = () => {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortField, setSortField] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/vendor-applications/');
      setApplications(response.results || response);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch vendor applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: VendorApplication) => {
    setSelectedApplication(application);
    setAdminNotes(application.notes || '');
    setShowModal(true);
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;

    setIsProcessing(true);
    try {
      await apiClient.patch(`/vendor-applications/${selectedApplication.id}/`, {
        status: 'approved',
        notes: adminNotes
      });

      // Update the user's role to vendor
      await apiClient.patch(`/users/${selectedApplication.applicant}/`, {
        user_type: 'vendor'
      });

      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: 'approved', notes: adminNotes, reviewed_at: new Date().toISOString() }
            : app
        )
      );

      setShowModal(false);
      setSelectedApplication(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving application:', error);
      setError('Failed to approve application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;

    setIsProcessing(true);
    try {
      await apiClient.patch(`/vendor-applications/${selectedApplication.id}/`, {
        status: 'rejected',
        notes: adminNotes
      });

      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: 'rejected', notes: adminNotes, reviewed_at: new Date().toISOString() }
            : app
        )
      );

      setShowModal(false);
      setSelectedApplication(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      setError('Failed to reject application');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      food: '🍔',
      beauty: '💄',
      printing: '🖨️',
      laundry: '👕',
      academic: '📚',
      transport: '🚗',
      health: '🏥',
      entertainment: '🎮',
      gym: '💪',
      other: '🔧'
    };
    return icons[category] || '🔧';
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const aValue = a[sortField as keyof VendorApplication];
    const bValue = b[sortField as keyof VendorApplication];
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Applications</h1>
          <p className="text-gray-600 mt-1">Review and manage vendor applications</p>
        </div>
        <div className="text-sm text-gray-500">
          {applications.length} total applications
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort */}
          <div className="md:w-48">
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortField(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="submitted_at-desc">Newest First</option>
              <option value="submitted_at-asc">Oldest First</option>
              <option value="business_name-asc">Business Name A-Z</option>
              <option value="business_name-desc">Business Name Z-A</option>
              <option value="status-asc">Status A-Z</option>
              <option value="status-desc">Status Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Applications List */}
      <div className="grid gap-4">
        {sortedApplications.map((application) => (
          <div key={application.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">{getCategoryIcon(application.category)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {application.business_name}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{application.applicant_username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span className="capitalize">{application.category.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 line-clamp-2 mb-3">
                    {application.business_description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {application.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{application.phone}</span>
                      </div>
                    )}
                    {application.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{application.email}</span>
                      </div>
                    )}
                    {application.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <span>Website</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleViewApplication(application)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedApplications.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter 
              ? 'No applications match your current filters.'
              : 'No vendor applications have been submitted yet.'
            }
          </p>
        </div>
      )}

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedApplication.business_name}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(selectedApplication.status)}
                <span className="text-sm text-gray-600">
                  Submitted by {selectedApplication.applicant_username}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Business Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Category:</strong> <span className="capitalize">{selectedApplication.category.replace('_', ' ')}</span></div>
                    <div><strong>Description:</strong> {selectedApplication.business_description}</div>
                    <div><strong>Address:</strong> {selectedApplication.address}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    {selectedApplication.phone && <div><strong>Phone:</strong> {selectedApplication.phone}</div>}
                    {selectedApplication.email && <div><strong>Email:</strong> {selectedApplication.email}</div>}
                    {selectedApplication.website && <div><strong>Website:</strong> {selectedApplication.website}</div>}
                  </div>
                </div>
              </div>

              {/* Experience and Reason */}
              {(selectedApplication.experience || selectedApplication.reason) && (
                <div className="space-y-4">
                  {selectedApplication.experience && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedApplication.experience}
                      </p>
                    </div>
                  )}

                  {selectedApplication.reason && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Reason for Joining</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedApplication.reason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleApproveApplication}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {isProcessing ? 'Approving...' : 'Approve Application'}
                  </button>
                  <button
                    onClick={handleRejectApplication}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    {isProcessing ? 'Rejecting...' : 'Reject Application'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
