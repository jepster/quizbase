import React from 'react';
import Modal from 'react-modal';

interface SuccessModalProps {
  isOpen: boolean;
  closeModal: () => void;
  successMessage: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, closeModal, successMessage }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Erfolg</h2>
        <p className="mb-6 text-gray-700">{successMessage}</p>
        <button
          onClick={closeModal}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Schließen
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
