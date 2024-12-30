import { useState } from 'react';

interface LoginFormProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function LoginForm({ setIsAuthenticated }: LoginFormProps) {
  const [codeword, setCodeword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = () => {
    if (codeword === 'sandra') {
      localStorage.setItem('authToken', 'authenticated');
      setIsAuthenticated(true);
    } else {
      setError('Falsches Codewort.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="h-screen flex justify-center">
      <div className="bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input
          className="w-full p-2 mt-2 mb-2 border-2 border-blue-500 rounded"
          placeholder="Codewort"
          value={codeword}
          onChange={(e) => setCodeword(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleLogin}
        >
          Login
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
