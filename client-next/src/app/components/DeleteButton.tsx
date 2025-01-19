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
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
    >
      {categoryHumanReadable}
    </button>
  );
};

export default DeleteButton;
