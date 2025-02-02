'use client'

import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import dynamic from 'next/dynamic';
import Main from '@/app/components/Main';
const FishingQuizDe = dynamic(() => import("@/app/components/domain/FishingQuizDe"), { ssr: false });

export default function Home() {
  const [currentDomain, setCurrentDomain] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname);
    }
  }, []);

  return (
    <Provider store={store}>
      {currentDomain === 'fishingquiz.de' ? <FishingQuizDe /> : <Main />}
    </Provider>
  );
}
