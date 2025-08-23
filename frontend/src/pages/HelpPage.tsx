import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-10 text-center">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-4">Help & Support</h1>
          <p className="text-lg text-blue-800 mb-6">
            Need assistance? We're here to help! Find answers to common questions or reach out for support below.
          </p>
          <div className="text-left text-blue-700 mb-6">
            <h2 className="text-xl font-bold mb-2">Frequently Asked Questions</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-semibold">How do I become a vendor?</span> <br />Apply on our <Link to="/vendor-application" className="text-blue-600 underline hover:text-blue-800">Vendor Application</Link> page.</li>
              <li><span className="font-semibold">How do I book a service?</span> <br />Browse and book services on the <Link to="/services" className="text-blue-600 underline hover:text-blue-800">Services</Link> page.</li>
              <li><span className="font-semibold">How do I contact support?</span> <br />Use the <Link to="/contact" className="text-blue-600 underline hover:text-blue-800">Contact Us</Link> form for direct assistance.</li>
            </ul>
          </div>
          <div className="mt-8">
            <Link to="/contact" className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-full shadow-md hover:from-blue-700 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpPage;
