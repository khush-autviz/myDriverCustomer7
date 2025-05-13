import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    ReactNode,
  } from 'react';
  import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
  
  type SocketContextType = Socket | null;
  
  const SocketContext = createContext<SocketContextType>(null);
  
  // Custom hook to use socket
  export const useSocket = (): SocketContextType => useContext(SocketContext);

  const TOKEN = useAuthStore(state => state.token)
  
  // Props for provider
  interface SocketProviderProps {
    children: ReactNode;
  }
  
  export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const socketRef = useRef<Socket | null>(null);
    const token = TOKEN?.access_token; // Replace with dynamic token if needed
  
    useEffect(() => {
      if (!token) return;
  
      socketRef.current = io('http://3.110.180.116:3000/', {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${token}`,
            },
          },
        },
      });
  
      console.log('Socket connected with headers');
  
      return () => {
        socketRef.current?.disconnect();
        console.log('Socket disconnected');
      };
    }, [token]);
  
    return (
      <SocketContext.Provider value={socketRef.current}>
        {children}
      </SocketContext.Provider>
    );
  };
  