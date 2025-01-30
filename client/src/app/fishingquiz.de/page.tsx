'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@/app/hooks/useSocket';
import Link from 'next/link';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import GameInterface from '@/app/components/GameInterface';

export default function App() {
  const socket = useSocket();
  const [gameState, setGameState] = useState<string>('start');
  const [roomId, setRoomId] = useState<string>('');
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent === 'accepted') {
      setShowCookieBanner(false);
    }
  }, []);

  const resetGame = () => {
    setGameState('start');
  };

  const setGameStateCallback = useCallback((newState: string | ((prevState: string) => string)) => {
    setGameState(newState);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieBanner(false);
  };

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {gameState === 'start' && (
          <div
            className="relative h-[400px] bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1483004406427-6acb078d1f2d?auto=format&fit=crop&q=80&w=2000")',
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
              <div className="text-white max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Teste dein Angelwissen</h1>
                <p className="text-xl md:text-2xl mb-8">
                  Fordere dich selbst heraus und erweitere dein Wissen rund ums Angeln mit unseren spannenden Quizzes
                </p>
              </div>
            </div>
          </div>
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

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2025 Angelquiz. Alle Rechte vorbehalten.</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/impressum" className="hover:text-gray-300">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-gray-300">Datenschutz</Link>
              <Link href="/agb" className="hover:text-gray-300">AGB</Link>
            </div>
          </div>
        </footer>

        {/* Cookie Consent Banner */}
        {showCookieBanner && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
              <p className="mb-4 md:mb-0">
                Diese Website verwendet Cookies, um Ihnen ein optimales Nutzererlebnis zu bieten. Durch die weitere Nutzung der Website stimmen Sie der Verwendung von Cookies zu.
              </p>
              <button
                onClick={handleAcceptCookies}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Akzeptieren
              </button>
            </div>
          </div>
        )}
      </div>
    </Provider>
  );
}
