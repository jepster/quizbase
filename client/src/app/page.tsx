'use client'

import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import dynamic from 'next/dynamic';
import Main from '@/app/components/Main';

const FishingQuizApp = dynamic(() => import('@/app/fishingquiz.de/page'), { ssr: false });

export default function Home() {
  const [currentDomain, setCurrentDomain] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname);
    }
  }, []);

  return (
    <Provider store={store}>
      {currentDomain === 'fishingquiz.de' ? <FishingQuizApp /> : <Main />}
    </Provider>
  );
}
