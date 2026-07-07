import React, { useEffect } from 'react';
import { LuX, LuShieldAlert, LuTriangleAlert, LuInfo } from 'react-icons/lu';

// Renders a single toast notification and auto-dismisses it after 5 seconds
const ToastItem = ({ toast, removeToast }) => {
  // Auto-remove this toast after 5 seconds; clears the timer if component unmounts early
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  // Maps severity level to matching Tailwind color classes
  const severityColors = {
    HIGH: 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400',
    MEDIUM: 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    LOW: 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400',
  };

  // Maps severity level to the appropriate icon component
  const icons = {
    HIGH: <LuShieldAlert size={20} />,
    MEDIUM: <LuTriangleAlert size={20} />,
    LOW: <LuInfo size={20} />
  };

  // Fall back to LOW styling if severity is unknown
  const colors = severityColors[toast.severity] || severityColors.LOW;
  const Icon = icons[toast.severity] || icons.LOW;

  return (
    <div className={`flex items-start w-80 p-4 rounded-lg border shadow-lg bg-white dark:bg-gray-800 ${colors} transition-all duration-300`}>
      <div className="mr-3 mt-0.5">{Icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{toast.title || toast.severity + ' Alert'}</h4>
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      {/* Close button manually dismisses the toast */}
      <button 
        onClick={() => removeToast(toast.id)} 
        className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
      >
        <LuX size={18} />
      </button>
    </div>
  );
};

import { createPortal } from 'react-dom';

// Renders all active toasts in a fixed bottom-right corner using a portal so they appear above all other content
export default function AlertToast({ toasts, removeToast }) {
  // Don't render anything if there are no toasts to show
  if (!toasts || toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id || toast._id} toast={toast} removeToast={removeToast} />
      ))}
    </div>,
    document.body
  );
}
