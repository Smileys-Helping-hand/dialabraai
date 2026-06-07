'use client';

import { AlertCircle } from 'lucide-react';

export default function FormField({
  label,
  required = false,
  error = '',
  icon: Icon = null,
  children,
  helperText = '',
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-charcoal">
        {label}
        {required && <span className="ml-0.5 text-flame">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35" />
        )}
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-charcoal/50">{helperText}</p>
      )}
    </div>
  );
}
