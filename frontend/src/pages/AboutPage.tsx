import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-10 text-center">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-4">About Unified Campus Services Platform</h1>
          <p className="text-lg text-blue-800 mb-6">
            The Unified Campus Services Platform (UCSP) is dedicated to connecting students, staff, and vendors across campus. Our mission is to streamline access to essential services, foster community engagement, and empower local businesses to thrive within the campus ecosystem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
            <div className="bg-blue-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-blue-700 mb-2">Our Vision</h2>
              <p className="text-blue-700">To be the leading digital hub for campus services, making life easier and more connected for everyone.</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-blue-700 mb-2">What We Offer</h2>
              <ul className="text-blue-700 list-disc list-inside text-left">
                <li>Easy vendor discovery and application</li>
                <li>Centralized service booking and management</li>
                <li>Secure payments and transparent reviews</li>
              </ul>
            </div>
            <div className="bg-blue-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-blue-700 mb-2">Get Involved</h2>
              <div className="flex flex-col items-center justify-center mt-2">
                <span className="text-blue-700 text-base font-medium mb-2">Are you a vendor or service provider?</span>
                <Link
                  to="/vendor-application"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-full shadow-md hover:from-blue-700 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-1"
                >
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Apply to Join
                  </span>
                </Link>
                <span className="text-blue-500 text-xs mt-1">Join our platform and grow your business!</span>
              </div>
            </div>
          </div>
          <p className="text-blue-600 mt-6">Have questions or feedback? <Link to="/contact" className="text-blue-700 underline hover:text-blue-900">Contact us</Link>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
