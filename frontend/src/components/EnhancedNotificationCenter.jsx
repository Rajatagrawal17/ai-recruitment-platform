import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info, MessageCircle } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import socketService from '../services/socketService';

const EnhancedNotificationCenter = ({ userId }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { isConnected } = useSocket(userId);

  // Listen for real-time updates
  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleAppStatusUpdate = (data) => {
      const notification = {
        id: Date.now(),
        type: 'success',
        title: '📊 Application Status Updated',
        message: `Your application for ${data.jobTitle} is now ${data.status}`,
        timestamp: new Date(),
        read: false,
      };
      addNotification(notification);
    };

    const handleShortlist = (data) => {
      const notification = {
        id: Date.now(),
        type: 'success',
        title: '🎉 You\'ve Been Shortlisted!',
        message: `Congratulations! You\'re shortlisted for ${data.jobTitle}`,
        timestamp: new Date(),
        read: false,
      };
      addNotification(notification);
      playSound();
    };

    const handleMessage = (data) => {
      const notification = {
        id: Date.now(),
        type: 'info',
        title: '💬 New Message',
        message: `${data.senderName}: ${data.message.substring(0, 50)}...`,
        timestamp: new Date(),
        read: false,
      };
      addNotification(notification);
    };

    const handleInterview = (data) => {
      const notification = {
        id: Date.now(),
        type: 'info',
        title: '📅 Interview Scheduled',
        message: `Interview for ${data.jobTitle} on ${data.date}`,
        timestamp: new Date(),
        read: false,
      };
      addNotification(notification);
      playSound();
    };

    socketService.on('applicationStatusUpdate', handleAppStatusUpdate);
    socketService.on('applicationShortlist', handleShortlist);
    socketService.on('newMessage', handleMessage);
    socketService.on('interviewScheduled', handleInterview);

    return () => {
      socketService.off('applicationStatusUpdate', handleAppStatusUpdate);
      socketService.off('applicationShortlist', handleShortlist);
      socketService.off('newMessage', handleMessage);
      socketService.off('interviewScheduled', handleInterview);
    };
  }, [userId]);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
    setUnreadCount((prev) => prev + 1);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const playSound = () => {
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj=='
    );
    audio.play().catch(() => {
      /* Silent fail if audio fails */
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'info':
        return <Info className="text-blue-600" size={20} />;
      case 'message':
        return <MessageCircle className="text-indigo-600" size={20} />;
      default:
        return <Info className="text-gray-600" size={20} />;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Icon with Badge */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="fixed top-6 right-6 z-50 relative"
      >
        <div className="relative">
          <Bell
            size={28}
            className={`${
              isConnected
                ? 'text-indigo-600'
                : 'text-gray-400'
            } transition-colors`}
          />

          {/* Unread Badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
              >
                <motion.span
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {Math.min(unreadCount, 9)}+
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connection Status Dot */}
          <motion.div
            animate={{
              opacity: isConnected ? 1 : 0.5,
              scale: isConnected ? 1 : 0.8,
            }}
            transition={{ duration: 0.5 }}
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`}
          />
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">Notifications</h2>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <span className="text-xs bg-green-400 px-2 py-1 rounded-full">
                    Live
                  </span>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs hover:bg-white/20 px-2 py-1 rounded transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {isConnected
                      ? 'Stay tuned for updates!'
                      : 'Reconnecting...'}
                  </p>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                >
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">
                            {notif.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notif.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 text-center border-t bg-gray-50">
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedNotificationCenter;
