import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from 'firebase/auth';

interface LoginProps {
  setUser: (user: User | null) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login or Sign Up</h2>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-400 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-4">
            <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
            Login
            </button>
            <button
            onClick={handleSignUp}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
            Sign Up
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
