// components/DomainHandler.tsx
'use client'

import dynamic from 'next/dynamic';

const DomainHandler = () => {
  if (typeof window === 'undefined') return null;

  return window.location.hostname === 'fishingquiz.de'
    ? dynamic(() => import('@/app/fishingquiz.de/page'))
    : dynamic(() => import('@/app/components/Main'));
};

export default DomainHandler;
