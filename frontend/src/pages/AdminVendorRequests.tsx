import React from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';

export const AdminVendorRequests: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Vendor Requests</h1>
            <p className="text-gray-600 mt-2">Manage vendor applications and approvals</p>
          </div>
          
          {/* MVP Placeholder */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">MVP Version</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Vendor request management is planned for a future release. 
                    For now, vendor applications can be managed through the Django admin panel.
                  </p>
                  <p className="mt-2">
                    <strong>To manage vendor requests:</strong>
                  </p>
                  <ol className="mt-1 list-decimal list-inside space-y-1">
                    <li>Access the Django admin panel at <code className="bg-yellow-100 px-1 rounded">/admin</code></li>
                    <li>Navigate to <strong>Users → Vendor Applications</strong></li>
                    <li>Review and approve/reject applications</li>
                    <li>Approved users will automatically become vendors</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          {/* Coming Soon Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Coming Soon</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Review pending applications</li>
                <li>• Bulk approve/reject actions</li>
                <li>• Application status tracking</li>
                <li>• Applicant communication</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-3">
                <a 
                  href="/admin" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Open Django Admin
                </a>
                <button 
                  disabled
                  className="block w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Export Applications (Soon)
                </button>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-medium">Coming Soon</span>
                </div>
                <div className="flex justify-between">
                  <span>Approved:</span>
                  <span className="font-medium">Coming Soon</span>
                </div>
                <div className="flex justify-between">
                  <span>Rejected:</span>
                  <span className="font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};