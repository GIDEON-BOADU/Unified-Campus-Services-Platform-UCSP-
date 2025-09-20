import React from 'react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { StudentServiceFeed } from '../components/student/StudentServiceFeed';
import { useServices } from '../hooks/useServices';

export const ServicesPage: React.FC = () => {
  const { services, isLoading, error } = useServices();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pb-24">
          <div className="text-center">
            <div className="text-red-600 text-xl font-semibold mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pb-24">
        <StudentServiceFeed 
          services={services} 
          isLoading={isLoading} 
        />
      </div>

      <Footer />
    </div>
  );
};