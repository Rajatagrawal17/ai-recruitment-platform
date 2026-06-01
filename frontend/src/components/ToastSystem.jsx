import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const typeStyles = {
  success: {
    icon: CheckCircle,
    color: '#10b981',
    progressBg: 'linear-gradient(90deg, #10b981, #059669)',
  },
  error: {
    icon: XCircle,
    color: '#ef4444',
    progressBg: 'linear-gradient(90deg, #ef4444, #dc2626)',
  },
  info: {
    icon: Info,
    color: '#3b82f6',
    progressBg: 'linear-gradient(90deg, #3b82f6, #2563eb)',
  },
  warning: {
    icon: AlertTriangle,
    color: '#f59e0b',
    progressBg: 'linear-gradient(90deg, #f59e0b, #d97706)',
  },
};

export default function ToastSystem() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
        maxWidth: '400px',
        width: 'calc(100% - 48px)',
      }}
      className="toast-container-mobile"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const style = typeStyles[t.type] || typeStyles.info;
          const Icon = style.icon;

          return (
            <ToastCard
              key={t.id}
              toast={t}
              Icon={Icon}
              style={style}
              onClose={() => removeToast(t.id)}
            />
          );
        })}
      </AnimatePresence>
      <style>{`
        @media (max-width: 640px) {
          .toast-container-mobile {
            right: 24px !important;
            left: 24px !important;
            bottom: 24px !important;
            width: auto !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function ToastCard({ toast, Icon, style, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  return (
    <motion.div
      initial={{ x: 120, opacity: 0, scale: 0.95 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ scale: 0.85, opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{
        background: 'rgba(15, 15, 26, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
      }}
    >
      <Icon size={20} style={{ color: style.color, flexShrink: 0 }} />
      
      <div style={{ flex: 1, color: '#f1f5f9', fontSize: '13px', fontWeight: 500, lineHeight: 1.4 }}>
        {toast.message}
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: style.progressBg,
        }}
      />
    </motion.div>
  );
}
