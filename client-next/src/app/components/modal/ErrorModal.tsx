import React from 'react';
import Modal from 'react-modal';

interface ErrorModalProps {
  isOpen: boolean;
  closeModal: () => void;
  errorMessage: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, closeModal, errorMessage }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Fehler</h2>
        <p className="mb-6 text-gray-700">{errorMessage}</p>
        <button
          onClick={closeModal}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ErrorModal;
