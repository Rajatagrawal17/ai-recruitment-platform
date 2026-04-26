import io from 'socket.io-client';
import { getBackendUrl } from "../utils/backendUrl";

const SOCKET_URL = getBackendUrl();

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      query: { userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
