import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-10 md:py-16 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#4F6EF7]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10 md:gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-xl md:text-2xl font-serif font-semibold tracking-tight mb-2 md:mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#0A1628] text-white flex items-center justify-center text-sm font-sans">OC</span>
              OnchainCity
            </span>
            <p className="text-gray-500 text-sm font-medium max-w-xs">
              Revolutionizing visa applications and travel connectivity with AI. Visas and eSIM data plans, all in one place.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6 md:gap-8">
            <div className="flex items-center gap-6 md:gap-8 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              <a href="#" className="hover:text-[#4F6EF7] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#4F6EF7] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#4F6EF7] transition-colors">Support</a>
            </div>
            
            <div className="flex gap-4">
              {['𝕏', 'in'].map(s => (
                <div key={s} className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#4F6EF7]/10 hover:text-[#4F6EF7] cursor-pointer transition-all min-w-[36px] min-h-[36px]">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center md:text-left">
          <p>© 2025 OnchainCity Inc. All Rights Reserved.</p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            System Status: All Systems Operational
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
