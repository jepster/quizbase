'use client'

import React, {useEffect, useState} from 'react';

const Footer = () => {

  const [showCookieBanner, setShowCookieBanner] = useState(true);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieBanner(false);
  };

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent === 'accepted') {
      setShowCookieBanner(false);
    }
  }, []);

  if (!showCookieBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="mb-4 md:mb-0">
          Diese Website verwendet Cookies, um Ihnen ein optimales Nutzererlebnis zu bieten. Durch die weitere
          Nutzung der Website stimmen Sie der Verwendung von Cookies zu.
        </p>
        <button
          onClick={handleAcceptCookies}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Akzeptieren
        </button>
      </div>
    </div>
  );
};

export default Footer;
