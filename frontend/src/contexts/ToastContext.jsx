import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => {
      // Limit to max 5 visible, oldest removes first
      const currentToasts = [...prev, { id, message, type, duration }];
      if (currentToasts.length > 5) {
        return currentToasts.slice(currentToasts.length - 5);
      }
      return currentToasts;
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    custom: (msg, type, dur) => addToast(msg, type || 'info', dur),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Support a fallback global import style similar to react-hot-toast if needed
export const toast = {
  success: (msg) => console.log('success toast:', msg),
  error: (msg) => console.log('error toast:', msg),
  info: (msg) => console.log('info toast:', msg),
  warning: (msg) => console.log('warning toast:', msg),
};
