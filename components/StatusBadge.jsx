'use client';

import { Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-800',
    icon: Clock,
    variant: 'warning',
  },
  quoted: {
    label: 'Quote Ready',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle2,
    variant: 'info',
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    variant: 'success',
  },
  rejected: {
    label: 'Declined',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    variant: 'error',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    variant: 'success',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
    variant: 'neutral',
  },
};

export default function StatusBadge({ status, label = null, size = 'md', showIcon = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  const displayLabel = label || config.label;

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${config.color} ${sizeClasses[size]}`}>
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />}
      {displayLabel}
    </span>
  );
}
