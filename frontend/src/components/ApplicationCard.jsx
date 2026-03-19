import React from 'react';

export function ApplicationCard({ application, onAction }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-green-500 text-white";
      case "completed": return "bg-green-500 text-white";
      case "pending": return "bg-orange-400 text-white";
      case "rejected": return "bg-red-500 text-white";
      case "processing": return "bg-blue-500 text-white";
      default: return "bg-gray-200 text-gray-600";
    }
  };

  const appId = typeof application.applicationId === 'object' ? JSON.stringify(application.applicationId) : (application.applicationId || application.id || 'N/A');
  const visaName = application.visaName || (application.visaId ? `Visa Order: ${application.visaId}` : 'Travel Application');

  return (
    <div className="flex flex-col sm:flex-row bg-white p-4 md:p-5 rounded-2xl border border-gray-100 items-start sm:items-center justify-between gap-4 shadow-sm">
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#6B7280]">Application ID: {appId}</p>
        <p className="font-sans font-bold text-[#0A1628] mt-1 truncate">{visaName}</p>
      </div>
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${getStatusColor(application.status)}`}>
          {typeof application.status === 'string' ? application.status : 'Processing'}
        </span>
        <button 
          onClick={() => onAction(`Check status for application ${application.id || application.applicationId}`)}
          className="h-10 px-6 bg-[#F8F9FF] text-[#4F6EF7] text-[11px] font-semibold uppercase tracking-widest rounded-xl border border-indigo-50 hover:bg-indigo-50 transition-all flex items-center justify-center whitespace-nowrap"
        >
          Details
        </button>
      </div>
    </div>
  );
}
