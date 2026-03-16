import React, { useState } from 'react';

const StructuredInputForm = ({ fields, onSubmit, isSubmitted }) => {
  const [formData, setFormData] = useState({});

  if (isSubmitted) {
    return (
      <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border border-green-100 animate-in fade-in slide-in-from-bottom-2">
        <span>✓ Submitted</span>
      </div>
    );
  }

  if (!fields || fields.length === 0) return null;

  const handleInputChange = (label, value, uppercase) => {
    let finalValue = value;
    if (uppercase) finalValue = value.toUpperCase();
    setFormData(prev => ({ ...prev, [label]: finalValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) return;
    onSubmit(formData);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 md:p-5 mt-2 max-w-full animate-in fade-in zoom-in-95 duration-300"
    >
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1628] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-3.5 rounded-full bg-[#4F6EF7]"></span>
        Fill in your details
      </h4>
      
      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div key={idx} className="flex flex-col">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
              {field.label}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              className="w-full bg-[#F8F9FF] border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/20 focus:border-[#4F6EF7] transition-all placeholder:text-gray-300 min-h-[48px]"
              value={formData[field.originalLabel] || ''}
              onChange={(e) => handleInputChange(field.originalLabel, e.target.value, field.uppercase)}
              required
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full bg-[#0A1628] text-white rounded-xl py-3.5 text-sm font-black uppercase tracking-widest mt-6 hover:bg-[#1a2940] transition-all shadow-lg shadow-[#0A1628]/20 flex items-center justify-center gap-2 group active:scale-[0.98] min-h-[50px]"
      >
        Send <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </form>
  );
};

export default StructuredInputForm;
