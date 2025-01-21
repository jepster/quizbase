import React, { useState, useEffect } from 'react';
import SuccessModal from "@/app/components/modal/SuccessModal";

export const useHackerMode = () => {
  const [isHackerMode, setIsHackerMode] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem('hackerMode');
    if (storedMode) {
      setIsHackerMode(JSON.parse(storedMode));
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === '1' && isHackerMode === false) {
        setIsHackerMode(true);
        localStorage.setItem('hackerMode', JSON.stringify(true));
      } else if (key === '0' && isHackerMode === true) {
        setIsHackerMode(false);
        localStorage.setItem('hackerMode', JSON.stringify(false));
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isHackerMode]);

  return isHackerMode;
};

const HackerMode: React.FC = () => {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === '1') {
        localStorage.setItem('hackerMode', JSON.stringify(true));
        setSuccessMessage('Hackermode erfolgreich eingeschaltet.');
        setIsSuccessModalOpen(true);
      } else if (key === '0') {
        localStorage.setItem('hackerMode', JSON.stringify(false));
        setSuccessMessage('Hackermode erfolgreich ausgeschaltet.');
        setIsSuccessModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <SuccessModal
      isOpen={isSuccessModalOpen}
      closeModal={() => setIsSuccessModalOpen(false)}
      successMessage={successMessage}
    />
  );
};

export default HackerMode;
