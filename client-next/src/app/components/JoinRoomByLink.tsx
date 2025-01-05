'use client';

import { Dispatch, SetStateAction } from 'react';
import useJoinRoomByLink from "@/app/hooks/useJoinRoomByLink";

interface JoinRoomByLinkProps {
  setGameState: Dispatch<SetStateAction<string>>;
  setRoomId: Dispatch<SetStateAction<string>>;
}

function JoinRoomByLink({ setGameState, setRoomId }: JoinRoomByLinkProps) {
  useJoinRoomByLink(setGameState, setRoomId);
  return null; // This component doesn't render anything
}

export default JoinRoomByLink;
