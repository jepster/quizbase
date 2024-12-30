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
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      </Head>
      <div className="flex-col">
        <div className="bg-white w-11/12 md:w-3/4 lg:w-3/4 xl:w-3/4 p-6 rounded-lg shadow-lg flex-grow mx-auto mt-10">
          {!isAuthenticated ? (
            <LoginForm setIsAuthenticated={setIsAuthenticated} />
          ) : (
            <GameInterface socket={socket} />
          )}
        </div>
      </div>
    </div>
  );
}
