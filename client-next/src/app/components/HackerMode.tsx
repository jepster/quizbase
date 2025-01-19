import React, { useState, useEffect } from 'react';
import SuccessModal from "@/app/components/modal/SuccessModal";

export const useHackerMode = () => {
  const [isHackerMode, setIsHackerMode] = useState(false);
  const [typedKeys, setTypedKeys] = useState('');

  useEffect(() => {
    const storedMode = localStorage.getItem('hackerMode');
    if (storedMode) {
      setIsHackerMode(JSON.parse(storedMode));
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      setTypedKeys(prev => {
        const updatedKeys = (prev + event.key).slice(-6);
        if (updatedKeys === 'hackr1') {
          setIsHackerMode(true);
          localStorage.setItem('hackerMode', JSON.stringify(true));
          return '';
        } else if (updatedKeys === 'unhack') {
          setIsHackerMode(false);
          localStorage.setItem('hackerMode', JSON.stringify(false));
          return '';
        }
        return updatedKeys;
      });
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return isHackerMode;
};

const HackerMode: React.FC = () => {
  const [isHackerMode, setIsHackerMode] = useState(false);
  const [typedKeys, setTypedKeys] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const storedMode = localStorage.getItem('hackerMode');
    if (storedMode) {
      setIsHackerMode(JSON.parse(storedMode));
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      setTypedKeys(prev => {
        const updatedKeys = (prev + event.key).slice(-6);
        if (updatedKeys === 'hackr1') {
          setIsHackerMode(true);
          localStorage.setItem('hackerMode', JSON.stringify(true));
          setSuccessMessage('Hackermode erfolgreich eingeschaltet.');
          setIsSuccessModalOpen(true);
          return '';
        } else if (updatedKeys === 'unhack') {
          setIsHackerMode(false);
          localStorage.setItem('hackerMode', JSON.stringify(false));
          setSuccessMessage('Hackermode erfolgreich ausgeschaltet.');
          setIsSuccessModalOpen(true);
          return '';
        }
        return updatedKeys;
      });
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <>
      <SuccessModal isOpen={isSuccessModalOpen} closeModal={() => setIsSuccessModalOpen(false)} successMessage={successMessage} />
    </>
  );
};

export default HackerMode;
