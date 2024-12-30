import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      autoConnect: true,
      path: process.env.NEXT_PUBLIC_SOCKET_PATH,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return socket;
}
