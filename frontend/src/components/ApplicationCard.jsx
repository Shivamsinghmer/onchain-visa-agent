import React from 'react';

export function ApplicationCard({ application, onAction }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-success text-white";
      case "pending": return "bg-warning text-white";
      case "rejected": return "bg-red-500 text-white";
      default: return "bg-border text-text";
    }
  };

  return (
    <div className="flex bg-surface p-4 rounded-xl border border-border items-center justify-between mb-2">
      <div>
        <p className="font-mono text-sm uppercase text-muted">ID: {application.id || 'N/A'}</p>
        <p className="font-sans font-medium">{application.visaId ? `Visa Reference: ${application.visaId}` : 'Visa Application'}</p>
      </div>
      <div className="flex space-x-4 items-center">
        <span className={`px-3 py-1 text-xs rounded-full font-bold ${getStatusColor(application.status)}`}>
          {application.status || 'Unknown'}
        </span>
        <button 
          onClick={() => onAction(`Check application status for ${application.id}`)}
          className="bg-bg text-text text-sm px-3 py-1.5 rounded border border-border hover:border-accent transition-colors"
        >
          Check
        </button>
      </div>
    </div>
  );
}
