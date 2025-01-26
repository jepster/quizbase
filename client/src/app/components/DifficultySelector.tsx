interface DifficultySelectorProps {
  onSelect: (difficulty: 'low' | 'high') => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Wähle die Schwierigkeit:</h3>
      <button
        onClick={() => onSelect('low')}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
      >
        Leicht
      </button>
      <button
        onClick={() => onSelect('high')}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Schwer
      </button>
    </div>
  );
};

export default DifficultySelector;
