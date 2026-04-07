import { useEffect, useState } from 'react';
import socketService from '../services/socketService';

export const useSocket = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const socket = socketService.connect(userId);
    setIsConnected(socket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    
    const handleApplicationUpdate = (data) => {
      setNotifications((prev) => [...prev, data]);
      console.log('📢 Application update:', data);
    };

    const handleApplicationShortlist = (data) => {
      console.log('🎉 Shortlisted:', data);
      setNotifications((prev) => [...prev, data]);
    };

    const handleMessage = (data) => {
      console.log('💬 New message:', data);
      setNotifications((prev) => [...prev, data]);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('applicationUpdate', handleApplicationUpdate);
    socket.on('applicationShortlist', handleApplicationShortlist);
    socket.on('message', handleMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('applicationUpdate', handleApplicationUpdate);
      socket.off('applicationShortlist', handleApplicationShortlist);
      socket.off('message', handleMessage);
    };
  }, [userId]);

  return { isConnected, notifications };
};

export default useSocket;
