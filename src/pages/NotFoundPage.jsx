import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/muncho_logo.svg';

const NotFoundPage = () => {
  const navigate = useNavigate();
  //set document title
  React.useEffect(() => {
    document.title = 'Page Not Found | Muncho';
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-satoshi">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <img src={logo} alt="Muncho Logo" className="w-32 mx-auto mb-8" />
        </div>

        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-[#4B21E2] mb-4 leading-none">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-[#201F33] mb-4">
            Page Not Found
          </h2>
          <p className="text-[#5C5C7A] text-lg leading-relaxed">
            Oops! The page you're looking for doesn't exist. Let's get you back to the dashboard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-[#4B21E2] text-white text-sm font-medium rounded-lg hover:bg-[#3D1ABD] transition-colors duration-200 cursor-pointer"
          >
            Return Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#F8F7FA] text-[#201F33] text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Optional decorative element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#EEEBFA] rounded-full opacity-20 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#F8F7FA] rounded-full opacity-30 transform translate-x-1/2 translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;