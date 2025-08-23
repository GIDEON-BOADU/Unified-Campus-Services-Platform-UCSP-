import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-10 text-left">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-4 text-center">Terms & Conditions</h1>
          <p className="text-blue-800 mb-6 text-center">Please read these terms and conditions carefully before using the Unified Campus Services Platform (UCSP).</p>
          <h2 className="text-xl font-bold text-blue-700 mt-6 mb-2">1. Acceptance of Terms</h2>
          <p className="text-blue-700 mb-4">By accessing or using UCSP, you agree to be bound by these terms. If you do not agree, please do not use the platform.</p>
          <h2 className="text-xl font-bold text-blue-700 mt-6 mb-2">2. User Responsibilities</h2>
          <ul className="list-disc list-inside text-blue-700 mb-4">
            <li>Provide accurate and up-to-date information during registration and use of services.</li>
            <li>Respect all users, vendors, and staff on the platform.</li>
            <li>Do not engage in fraudulent, abusive, or illegal activities.</li>
          </ul>
          <h2 className="text-xl font-bold text-blue-700 mt-6 mb-2">3. Vendor Guidelines</h2>
          <ul className="list-disc list-inside text-blue-700 mb-4">
            <li>Vendors must comply with campus and national regulations.</li>
            <li>All services and products must be accurately described.</li>
            <li>Vendors are responsible for the quality and delivery of their services.</li>
          </ul>
          <h2 className="text-xl font-bold text-blue-700 mt-6 mb-2">4. Limitation of Liability</h2>
          <p className="text-blue-700 mb-4">UCSP is not liable for any damages or losses resulting from the use of the platform. Users and vendors are responsible for their own actions and transactions.</p>
          <h2 className="text-xl font-bold text-blue-700 mt-6 mb-2">5. Changes to Terms</h2>
          <p className="text-blue-700 mb-4">We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of the new terms.</p>
          <p className="text-blue-600 mt-8 text-center">If you have questions about these terms, please <a href="/contact" className="text-blue-700 underline hover:text-blue-900">contact us</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
