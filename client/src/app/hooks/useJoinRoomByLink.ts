'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

export default function useJoinRoomByLink(
  setGameState: Dispatch<SetStateAction<string>>,
  setRoomId: Dispatch<SetStateAction<string>>
) {
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
