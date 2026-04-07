import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

const notificationVariants = {
  hidden: { opacity: 0, x: 400, y: -20 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: 400,
    transition: { duration: 0.3 },
  },
};

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="text-green-600" size={24} />;
    case 'error':
      return <AlertCircle className="text-red-600" size={24} />;
    case 'info':
      return <Info className="text-blue-600" size={24} />;
    default:
      return <Bell className="text-indigo-600" size={24} />;
  }
};

const getBackgroundColor = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
    default:
      return 'bg-indigo-50 border-indigo-200';
  }
};

const AnimatedNotification = ({ notification, onRemove, autoClose = 5000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => onRemove(notification.id), autoClose);
      return () => clearTimeout(timer);
    }
  }, [notification.id, autoClose, onRemove]);

  return (
    <motion.div
      variants={notificationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`${getBackgroundColor(notification.type)} border rounded-lg p-4 shadow-lg flex items-start gap-4 max-w-md`}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex-shrink-0"
      >
        {getIcon(notification.type)}
      </motion.div>

      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
        <p className="text-sm text-gray-700">{notification.message}</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onRemove(notification.id)}
        className="flex-shrink-0 text-gray-500 hover:text-gray-700"
      >
        <X size={20} />
      </motion.button>

      {/* Auto-close progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: autoClose / 1000, ease: 'linear' }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-b-lg"
      />
    </motion.div>
  );
};

export const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div key={notification.id} className="pointer-events-auto">
            <AnimatedNotification
              notification={notification}
              onRemove={onRemove}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedNotification;
