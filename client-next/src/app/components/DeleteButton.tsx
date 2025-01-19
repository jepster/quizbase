import React from 'react';

interface DropButtonProps {
  onDelete: () => void;
  buttonText: string;
}

const DeleteButton: React.FC<DropButtonProps> = ({ onDelete, buttonText }) => {
  const handleDelete = () => {
    onDelete();
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
    >
      {buttonText}
    </button>
  );
};

export default DeleteButton;
