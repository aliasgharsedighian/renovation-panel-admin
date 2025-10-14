'use client';

import { Check, X } from 'lucide-react';

interface StatusIndicatorProps {
  status: boolean;
  label?: string;
  size?: number;
}

export default function BooleanField({
  status,
  label,
  size = 20
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`flex items-center justify-center rounded-full p-1 ${
          status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}
        style={{ width: size, height: size }}
      >
        {status ? <Check size={size * 0.7} /> : <X size={size * 0.7} />}
      </div>
      {label && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </div>
  );
}
