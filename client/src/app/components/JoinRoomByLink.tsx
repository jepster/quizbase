'use client';

import { Dispatch, SetStateAction } from 'react';
import useJoinSinglePlayerQuizByLink from "@/app/hooks/useJoinRoomByLink";

interface JoinRoomByLinkProps {
  setGameState: Dispatch<SetStateAction<string>>;
  setRoomId: Dispatch<SetStateAction<string>>;
}

function JoinRoomByLink({ setGameState, setRoomId }: JoinRoomByLinkProps) {
  useJoinSinglePlayerQuizByLink(setGameState, setRoomId);
  return null; // This component doesn't render anything
}

export default JoinRoomByLink;
