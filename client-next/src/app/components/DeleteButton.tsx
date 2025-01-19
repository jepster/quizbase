import React from 'react';

interface DropButtonProps {
  onDelete: () => void;
  categoryHumanReadable: string;
}

const DeleteButton: React.FC<DropButtonProps> = ({ onDelete, categoryHumanReadable }) => {
  const handleDelete = () => {
    onDelete();
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2 inline-flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      {categoryHumanReadable}
    </button>
  );
};

export default DeleteButton;
