import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={`transition-all duration-400 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`}>
      {children}
    </div>
  );
}
