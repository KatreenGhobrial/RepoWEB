import React, { useEffect } from 'react';
import { LuX, LuShieldAlert, LuTriangleAlert, LuInfo } from 'react-icons/lu';

const ToastItem = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const severityColors = {
    HIGH: 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400',
    MEDIUM: 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    LOW: 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400',
  };

  const icons = {
    HIGH: <LuShieldAlert size={20} />,
    MEDIUM: <LuTriangleAlert size={20} />,
    LOW: <LuInfo size={20} />
  };

  const colors = severityColors[toast.severity] || severityColors.LOW;
  const Icon = icons[toast.severity] || icons.LOW;

  return (
    <div className={`flex items-start w-80 p-4 rounded-lg border shadow-lg bg-white dark:bg-gray-800 ${colors} transition-all duration-300`}>
      <div className="mr-3 mt-0.5">{Icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{toast.title || toast.severity + ' Alert'}</h4>
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
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

export default function AlertToast({ toasts, removeToast }) {
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
