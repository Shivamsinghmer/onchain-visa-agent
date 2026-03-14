import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

export function OTPModal({ onSubmit, onClose }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const newCode = [...code];
    newCode[idx] = val[val.length - 1]; // take last char if paste
    setCode(newCode);

    if (idx < 5 && val) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
    if (e.key === 'Backspace') {
      const newCode = [...code];
      newCode[idx] = '';
      setCode(newCode);
    }
  };

  const submitForm = (e) => {
    e.preventDefault();
    const finalCode = code.join('');
    if (finalCode.length === 6) {
      onSubmit(finalCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-in">
      <div className="bg-surface border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative p-8">
         <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-white transition-colors">
           <X className="w-5 h-5" />
         </button>

         <h2 className="text-2xl font-display font-bold text-center mb-2">Verification Code</h2>
         <p className="text-muted text-sm text-center mb-6">Check your email for the 6-digit code</p>

         <form onSubmit={submitForm} className="flex flex-col items-center">
            <div className="flex space-x-2 mb-8">
               {code.map((v, i) => (
                 <input 
                   key={i}
                   type="text"
                   inputMode="numeric"
                   maxLength={1}
                   value={v}
                   onChange={(e) => handleChange(e, i)}
                   onKeyDown={(e) => handleKeyDown(e, i)}
                   ref={(el) => (inputsRef.current[i] = el)}
                   className="w-12 h-14 bg-bg border border-border text-center rounded-lg text-2xl font-mono text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                 />
               ))}
            </div>

            <button
               type="submit"
               disabled={code.join('').length !== 6}
               className="w-full bg-accent text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent2 transition-colors duration-300"
            >
               Verify OTP
            </button>
         </form>
      </div>
    </div>
  );
}
