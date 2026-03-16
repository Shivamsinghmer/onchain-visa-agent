import React, { useState } from 'react';

const StructuredInputForm = ({ fields, onSubmit, isSubmitted, disabled }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (label, value, uppercase) => {
    setFormData(prev => ({
      ...prev,
      [label]: uppercase ? value.toUpperCase() : value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs font-black uppercase tracking-widest animate-in fade-in zoom-in duration-500">
        <span className="text-sm">✓</span> Submitted
      </div>
    );
  }

  return (
    <div className={`bg-white shadow-sm border border-gray-100 rounded-2xl p-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500 ${disabled ? 'opacity-50 grayscale pointer-events-none' : 'hover:shadow-md'} transition-all`}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A1628] mb-6">Details Required</h3>
      
      <div className="space-y-5">
        {fields.map((field, idx) => (
          <div key={idx} className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {field.label}
            </label>
            <input
              type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'tel' ? 'tel' : 'text'}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              value={formData[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value, field.uppercase)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-[#0A1628] outline-none focus:ring-2 focus:ring-[#4F6EF7]/10 focus:border-[#4F6EF7]/30 transition-all font-medium"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onSubmit(formData)}
        disabled={fields.some(f => !formData[f.label])}
        className="w-full mt-8 h-12 bg-[#0A1628] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#0A1628]/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 transition-all"
      >
        Send Details
      </button>

      {disabled && (
        <p className="text-[9px] font-medium text-gray-400 text-center mt-3 uppercase tracking-wider">Active on latest message only</p>
      )}
    </div>
  );
};

export default StructuredInputForm;
