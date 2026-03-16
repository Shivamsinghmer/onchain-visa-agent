import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-bold font-serif text-[#0A1628] tracking-tight">OnchainCity</span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#" className="hover:text-[#4F6EF7] transition-colors">Safety</a>
            <a href="#" className="hover:text-[#4F6EF7] transition-colors">Support</a>
            <a href="#" className="hover:text-[#4F6EF7] transition-colors">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/chat')}
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-[#0A1628] text-white text-xs md:text-sm font-semibold shadow-lg shadow-[#0A1628]/20 hover:scale-105 transition-all duration-300 active:scale-95 min-h-[40px]"
            >
              Start Application
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-[#0A1628] focus:outline-none min-w-[44px]"
            >
              <span className="text-2xl">{isOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-white ${isOpen ? 'max-h-64 border-b border-gray-100' : 'max-h-0'}`}>
        <div className="px-4 pt-2 pb-6 space-y-1">
          {['Safety', 'Support', 'Contact'].map((item) => (
            <a
              key={item}
              href="#"
              className="block px-3 py-4 text-base font-bold text-[#6B7280] hover:text-[#4F6EF7] hover:bg-gray-50 rounded-xl transition-all"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
