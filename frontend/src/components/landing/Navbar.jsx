import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-serif text-[#0A1628] tracking-tight">OnchainCity</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#" className="hover:text-[#4F6EF7] transition-colors">Safety</a>
            <a href="#" className="hover:text-[#4F6EF7] transition-colors">Support</a>
            <a href="#" className="hover:text-[#4F6EF7] transition-colors">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/chat')}
              className="px-6 py-2.5 rounded-full bg-[#0A1628] text-white text-sm font-semibold shadow-lg shadow-[#0A1628]/20 hover:scale-105 transition-all duration-300 active:scale-95"
            >
              Start Application
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
