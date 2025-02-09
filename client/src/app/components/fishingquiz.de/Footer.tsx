'use client'

import React from 'react';
import Link from "next/link";

export default function Footer() {
  return (
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
  );
}