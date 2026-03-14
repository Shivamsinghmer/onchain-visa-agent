import React, { useState } from 'react';

const OTPModal = ({ isOpen, onClose, onSubmit, email }) => {
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1628]/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[#4F6EF7]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
            📧
          </div>
          <h3 className="text-2xl font-serif font-black text-[#0A1628] mb-2">Verify your email</h3>
          <p className="text-sm text-[#6B7280] font-medium leading-relaxed mb-8">
            We've sent a 6-digit code to <br /><span className="text-[#0A1628] font-bold">{email}</span>
          </p>

          <div className="space-y-6">
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="0 0 0 0 0 0"
              className="w-full text-center text-3xl font-black tracking-[0.3em] py-4 rounded-2xl bg-[#F8F9FF] border-2 border-transparent focus:border-[#4F6EF7] focus:bg-white transition-all outline-none placeholder:text-gray-300"
              autoFocus
            />

            <button
              onClick={() => {
                if (otp.length === 6) {
                  onSubmit(otp);
                  setOtp('');
                }
              }}
              disabled={otp.length !== 6}
              className="w-full py-4 rounded-2xl bg-[#0A1628] text-white font-black text-sm shadow-xl shadow-[#0A1628]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              Verify & Continue
            </button>

            <button
              onClick={onClose}
              className="text-xs font-bold text-[#6B7280] hover:text-[#0A1628] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
        <div className="bg-[#F8F9FF] py-4 px-8 border-t border-gray-100">
          <p className="text-[10px] text-center font-bold text-[#6B7280] uppercase tracking-widest">
            Identity secured by OnchainCity
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
