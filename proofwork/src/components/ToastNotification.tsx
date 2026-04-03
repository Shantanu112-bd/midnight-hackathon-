import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Info, CheckCircle } from 'lucide-react';

interface ToastNotificationProps {
  show: boolean;
  message: string;
  type?: 'success' | 'info';
  onClose?: () => void;
}

export default function ToastNotification({ show, message, type = 'success', onClose }: ToastNotificationProps) {
  const [internalShow, setInternalShow] = useState(show);

  useEffect(() => {
    setInternalShow(show);
    
    if (show) {
      const timer = setTimeout(() => {
        setInternalShow(false);
        if (onClose) onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div 
      className={clsx(
        "fixed bottom-8 right-8 z-[60] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 ease-out",
        internalShow ? "translate-y-0 opacity-100" : "translate-y-[150%] opacity-0",
        type === 'success' ? "bg-greenSuccess text-navy" : "bg-blueAccent text-navy"
      )}
    >
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}
