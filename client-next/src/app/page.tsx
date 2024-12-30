'use client'

import { useState, useEffect } from 'react';
import Head from 'next/head';
import LoginForm from '@/app/components/LoginForm';
import GameInterface from '@/app/components/GameInterface';
import { useSocket } from '@/app/hooks/useSocket';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const socket = useSocket();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="h-screen flex justify-center">
      <Head>
        <title>QuizMaster: Fun Quizzes for Your Spare Time!</title>
      </Head>
      <div className="flex-col w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white w-full p-6 rounded-lg shadow-lg flex-grow mx-auto mt-10">
          {!isAuthenticated ? (
            <LoginForm setIsAuthenticated={setIsAuthenticated}/>
          ) : (
            <GameInterface socket={socket}/>
          )}
        </div>
      </div>
    </div>
  );
}
