'use client';

import React, {useState, useCallback, useEffect} from 'react';
import {useSocket} from '@/app/hooks/useSocket';
import {Provider, useSelector} from 'react-redux';
import {RootState, store} from '@/app/store';
import GameInterface from '@/app/components/GameInterface';
import Head from "next/head";
import LoginForm from "@/app/components/LoginForm";
import Header from "@/app/components/fishingquiz.de/Header";
import Footer from "@/app/components/fishingquiz.de/Footer";
import CookieBanner from "@/app/components/CookieBanner";

export default function FishingQuizDe() {
  const socket = useSocket();
  const [gameState, setGameState] = useState<string>('start');
  const [roomId, setRoomId] = useState<string>('');
  const authToken = useSelector((state: RootState) => state.user.authToken);
  const isAuthenticated = authToken === 'authenticated';

  useEffect(() => {
    // @ts-expect-error Matomo snippet code.
    const _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function () {
      const u = "//fishingquiz.de/matomo/";
      _paq.push(['setTrackerUrl', u + 'matomo.php']);
      _paq.push(['setSiteId', '1']);
      const d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
      // @ts-expect-error Matomo snippet code.
      g.async = true;
      g.src = u + 'matomo.js';
      s.parentNode.insertBefore(g, s);
    })();
  }, []);

  const resetGame = () => {
    setGameState('start');
  };

  const setGameStateCallback = useCallback((newState: string | ((prevState: string) => string)) => {
    setGameState(newState);
  }, []);

  return (
    <>
      <Provider store={store}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {gameState === 'start' && (
            <Header/>
          )}

          {/* Categories Section */}
          <div className="max-w-7xl mx-auto px-4 py-16 flex-grow">
            {gameState === 'start' && (
              <>
                <h2 className="text-3xl font-bold text-center">Quiz-Kategorien</h2>
              </>
            )}

            <div className="flex justify-center">
              <div className="flex-col w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="bg-white w-full p-6 rounded-lg shadow-lg flex-grow mx-auto mt-10">
                  <GameInterface
                    socket={socket}
                    gameState={gameState}
                    setGameState={setGameStateCallback}
                    resetGame={resetGame}
                    setRoomId={setRoomId}
                    roomId={roomId}
                  />
                </div>
              </div>
            </div>
          </div>

          <CookieBanner/>
          <Footer/>

        </div>
      </Provider>
    </>
  );
}
