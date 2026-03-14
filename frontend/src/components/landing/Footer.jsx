import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F6EF7]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-serif font-black tracking-tight mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#0A1628] text-white flex items-center justify-center text-sm font-sans">OC</span>
              OnchainCity
            </span>
            <p className="text-gray-500 text-sm font-medium">
              Revolutionizing visa applications with AI.
            </p>
          </div>

          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <a href="#" className="hover:text-[#4F6EF7] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#4F6EF7] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#4F6EF7] transition-colors">Support</a>
            <div className="flex gap-4 ml-4">
              {['𝕏', 'in'].map(s => (
                <div key={s} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#4F6EF7]/10 hover:text-[#4F6EF7] cursor-pointer transition-all">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">
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
