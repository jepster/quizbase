import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function useJoinRoomByLink(setGameState: (value: (((prevState: string) => string) | string)) => void, setRoomId: (value: (((prevState: string) => string) | string)) => void) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const roomId = searchParams.get('roomId');

    if (roomId) {
      localStorage.setItem('authToken', 'authenticated');
      setRoomId(roomId);
      setGameState('room-join-by-link');
    }
  }, [searchParams, setGameState, setRoomId]);
}
