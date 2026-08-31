import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface PresenceUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: PresenceUser[];
  joinProjectRoom: (projectId: number, user: PresenceUser) => void;
  leaveProjectRoom: (projectId: number) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeUsers: [],
  joinProjectRoom: () => {},
  leaveProjectRoom: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const socketInstance = io('http://localhost:5001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.io Client] Connected to backend websocket server');
      setIsConnected(true);
    });

    socketInstance.on('presence-update', (data: { projectId: number; activeUsers: PresenceUser[] }) => {
      setActiveUsers(data.activeUsers || []);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket.io Client] Disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinProjectRoom = (projectId: number, user: PresenceUser) => {
    if (socket && isConnected) {
      socket.emit('join-project', { projectId, user });
    }
  };

  const leaveProjectRoom = (projectId: number) => {
    if (socket && isConnected) {
      socket.emit('leave-project', { projectId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeUsers,
        joinProjectRoom,
        leaveProjectRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
