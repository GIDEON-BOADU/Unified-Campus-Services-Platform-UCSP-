import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Shield, 
  Edit, 
  Save, 
  X,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface VendorProfile {
  id: number;
  user: number;
  user_username: string;
  user_email: string;
  user_full_name: string;
  business_name: string;
  description: string;
  business_hours: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  is_verified: boolean;
  is_active: boolean;
  mtn_momo_number?: string;
  vodafone_cash_number?: string;
  airtel_money_number?: string;
  telecel_cash_number?: string;
  preferred_payment_method?: string;
  created_at: string;
  updated_at: string;
}

const AdminVendorManagement: React.FC = () => {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<VendorProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/vendor-profiles/');
      setVendors(response.results || response);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor: VendorProfile) => {
    setEditingVendor(vendor.id);
    setEditForm({
      business_name: vendor.business_name,
      description: vendor.description,
      business_hours: vendor.business_hours,
      address: vendor.address,
      phone: vendor.phone,
      email: vendor.email,
      website: vendor.website,
      mtn_momo_number: vendor.mtn_momo_number || '',
      vodafone_cash_number: vendor.vodafone_cash_number || '',
      airtel_money_number: vendor.airtel_money_number || '',
      telecel_cash_number: vendor.telecel_cash_number || '',
      preferred_payment_method: vendor.preferred_payment_method || 'mtn_momo',
    });
  };

  const handleSave = async () => {
    if (!editingVendor) return;

    try {
      await apiClient.patch(`/vendor-profiles/${editingVendor}/`, editForm);
      setVendors(prev => 
        prev.map(vendor => 
          vendor.id === editingVendor 
            ? { ...vendor, ...editForm }
            : vendor
        )
      );
      setEditingVendor(null);
      setEditForm({});
      setSuccess('Vendor updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating vendor:', error);
      setError('Failed to update vendor');
    }
  };

  const handleCancel = () => {
    setEditingVendor(null);
    setEditForm({});
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mtn_momo': return '🟡';
      case 'vodafone_cash': return '🔴';
      case 'airtel_money': return '🔵';
      case 'telecel_cash': return '🟣';
      case 'bank_transfer': return '🏦';
      case 'cash': return '💵';
      default: return '💳';
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'mtn_momo': return 'MTN Mobile Money';
      case 'vodafone_cash': return 'Vodafone Cash';
      case 'airtel_money': return 'Airtel Money';
      case 'telecel_cash': return 'Telecel Cash';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash Payment';
      default: return method;
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">Manage vendor profiles and payment information</p>
        </div>
        <div className="text-sm text-gray-500">
          {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} registered
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Vendors List */}
      <div className="grid gap-6">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {vendor.business_name}
                    {vendor.is_verified && (
                      <Shield className="w-5 h-5 text-green-500" />
                    )}
                  </h3>
                  <p className="text-gray-600">by {vendor.user_username}</p>
                </div>
              </div>
              <button
                onClick={() => handleEdit(vendor)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>

            {editingVendor === vendor.id ? (
              /* Edit Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={editForm.business_name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, business_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={editForm.website || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Mobile Money Fields */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">MTN MoMo Number</label>
                      <input
                        type="text"
                        value={editForm.mtn_momo_number || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, mtn_momo_number: e.target.value }))}
                        placeholder="0241234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vodafone Cash Number</label>
                      <input
                        type="text"
                        value={editForm.vodafone_cash_number || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, vodafone_cash_number: e.target.value }))}
                        placeholder="0201234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Airtel Money Number</label>
                      <input
                        type="text"
                        value={editForm.airtel_money_number || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, airtel_money_number: e.target.value }))}
                        placeholder="0261234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telecel Cash Number</label>
                      <input
                        type="text"
                        value={editForm.telecel_cash_number || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, telecel_cash_number: e.target.value }))}
                        placeholder="0271234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Payment Method</label>
                      <select
                        value={editForm.preferred_payment_method || 'mtn_momo'}
                        onChange={(e) => setEditForm(prev => ({ ...prev, preferred_payment_method: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="mtn_momo">MTN Mobile Money</option>
                        <option value="vodafone_cash">Vodafone Cash</option>
                        <option value="airtel_money">Airtel Money</option>
                        <option value="telecel_cash">Telecel Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash Payment</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{vendor.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{vendor.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{vendor.address || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{vendor.website || 'Not provided'}</span>
                  </div>
                </div>

                {/* Mobile Money Display */}
                {(vendor.mtn_momo_number || vendor.vodafone_cash_number || 
                  vendor.airtel_money_number || vendor.telecel_cash_number) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Methods
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vendor.mtn_momo_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>🟡</span>
                          <span className="font-medium">MTN MoMo:</span>
                          <span className="text-gray-600">{vendor.mtn_momo_number}</span>
                        </div>
                      )}
                      {vendor.vodafone_cash_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>🔴</span>
                          <span className="font-medium">Vodafone Cash:</span>
                          <span className="text-gray-600">{vendor.vodafone_cash_number}</span>
                        </div>
                      )}
                      {vendor.airtel_money_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>🔵</span>
                          <span className="font-medium">Airtel Money:</span>
                          <span className="text-gray-600">{vendor.airtel_money_number}</span>
                        </div>
                      )}
                      {vendor.telecel_cash_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>🟣</span>
                          <span className="font-medium">Telecel Cash:</span>
                          <span className="text-gray-600">{vendor.telecel_cash_number}</span>
                        </div>
                      )}
                    </div>
                    {vendor.preferred_payment_method && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Preferred:</span> {getPaymentMethodName(vendor.preferred_payment_method)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminVendorManagement;
