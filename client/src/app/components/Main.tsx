import {useSocket} from "@/app/hooks/useSocket";
import {Suspense, useCallback, useState} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/app/store";
import JoinRoomByLink from "@/app/components/JoinRoomByLink";
import Head from "next/head";
import Link from "next/link";
import LoginForm from "@/app/components/LoginForm";
import DevGameInterface from "@/app/components/DevGameInterface";

export default function Main() {
  const socket = useSocket();
  const [gameState, setGameState] = useState<string>('start');
  const authToken = useSelector((state: RootState) => state.user.authToken);
  const isAuthenticated = authToken === 'authenticated';
  const [roomId, setRoomId] = useState<string>('');

  const resetGame = () => {
    setGameState('start');
  };

  const setGameStateCallback = useCallback((newState: string | ((prevState: string) => string)) => {
    setGameState(newState);
  }, []);

  return (
    <div className="h-screen flex justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <JoinRoomByLink setGameState={setGameStateCallback} setRoomId={setRoomId} />
      </Suspense>
      <Head>
        <title>QuizMaster: Fun Quizzes for Your Spare Time!</title>
      </Head>
      <div className="flex-col w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white w-full p-6 rounded-lg shadow-lg flex-grow mx-auto mt-10">
          <div>
            <Link href="/" onClick={resetGame}
                  className="inline-flex items-center text-black font-bold pb-4 rounded">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Zur Startseite
            </Link>
          </div>
          {!isAuthenticated ? (
            <LoginForm />
          ) : (
            <DevGameInterface
              socket={socket}
              gameState={gameState}
              setGameState={setGameStateCallback}
              resetGame={resetGame}
              setRoomId={setRoomId}
              roomId={roomId}
            />
          )}
        </div>
      </div>
    </div>
  );
}