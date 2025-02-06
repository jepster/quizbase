import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthToken } from "@/app/store/slices/userSlice";

export default function LoginForm() {
  const [codeword, setCodeword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const dispatch = useDispatch();

  const handleLogin = () => {
    if (codeword === 'sandra') {
      dispatch(setAuthToken('authenticated'));
    } else {
      setError('Falsches Codewort.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin();
    }}>
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input
        type="password"
        className="w-full p-2 mt-2 mb-2 border-2 border-blue-500 rounded"
        placeholder="Codewort"
        value={codeword}
        onChange={(e) => setCodeword(e.target.value)}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleLogin}
        type="submit"
      >
        Login
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
