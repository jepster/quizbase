'use client'

import React from 'react';

export default function Header() {
  return (
    <div
      className="relative h-[400px] bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1483004406427-6acb078d1f2d?auto=format&fit=crop&q=80&w=2000")',
      }}
    >
      <div className="absolute inset-0 bg-black/50"/>
      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="text-white max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Teste dein Angelwissen</h1>
          <p className="text-xl md:text-2xl mb-8">
            Fordere dich selbst heraus und erweitere dein Wissen rund ums Angeln mit spannenden Quizzes.
          </p>
        </div>
      </div>
    </div>
  );
}