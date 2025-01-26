'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

export default function useJoinSinglePLayerQuizByLink(
  setGameState: Dispatch<SetStateAction<string>>,
  setRoomId: Dispatch<SetStateAction<string>>
) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const roomId = searchParams.get('categoryId');

    if (roomId) {
      localStorage.setItem('authToken', 'authenticated');
      setRoomId(roomId);
      setGameState('room-join-by-link');
    }
  }, [searchParams, setGameState, setRoomId]);
}
