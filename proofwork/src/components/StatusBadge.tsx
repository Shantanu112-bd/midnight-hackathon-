import React from 'react';
import { CheckCircle } from 'lucide-react';
import clsx from 'clsx';

export type StatusType = 'PENDING' | 'FULFILLED' | 'BROKEN' | 'VALID' | 'SUBMITTED';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const baseClasses = "px-3 py-1 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest border inline-flex items-center gap-1.5";
  
  const statusConfig: Record<StatusType, string> = {
    PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    FULFILLED: "bg-greenSuccess/10 text-greenSuccess border-greenSuccess/20",
    BROKEN: "bg-red-500/10 text-red-500 border-red-500/20",
    VALID: "bg-greenSuccess/10 text-greenSuccess border-greenSuccess/20",
    SUBMITTED: "bg-purpleAccent/10 text-purpleAccent border-purpleAccent/20"
  };

  return (
    <div className={clsx(baseClasses, statusConfig[status], className)}>
      {status === 'VALID' && <CheckCircle className="w-3 h-3" />}
      {status}
    </div>
  );
}
