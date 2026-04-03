import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import clsx from 'clsx';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={clsx(
        "p-1.5 rounded-md transition-colors hover:bg-white/10",
        copied ? "text-greenSuccess" : "text-white/50 hover:text-white",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? (
        <Icon icon="lucide:check" className="w-4 h-4" />
      ) : (
        <Icon icon="lucide:copy" className="w-4 h-4" />
      )}
    </button>
  );
}
