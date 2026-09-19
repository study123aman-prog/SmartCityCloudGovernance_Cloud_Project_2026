import React from 'react';

export default function RiskBadge({ level = 'LOW', score = null, size = 'md' }) {
  const normalized = String(level || 'LOW').toUpperCase();

  const config = {
    CRITICAL: {
      badgeClass: 'badge-critical',
      dotClass: 'bg-red-500 animate-ping',
      label: 'CRITICAL',
    },
    HIGH: {
      badgeClass: 'badge-high',
      dotClass: 'bg-orange-500',
      label: 'HIGH',
    },
    MEDIUM: {
      badgeClass: 'badge-medium',
      dotClass: 'bg-amber-500',
      label: 'MEDIUM',
    },
    LOW: {
      badgeClass: 'badge-low',
      dotClass: 'bg-emerald-500',
      label: 'LOW',
    },
  }[normalized] || {
    badgeClass: 'badge-low',
    dotClass: 'bg-emerald-500',
    label: normalized,
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full ${config.badgeClass} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        {normalized === 'CRITICAL' && (
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass.split(' ')[0]}`} />
      </span>
      <span>{config.label}</span>
      {score !== null && score !== undefined && (
        <span className="opacity-75 text-[11px]">({Number(score).toFixed(0)}%)</span>
      )}
    </span>
  );
}
