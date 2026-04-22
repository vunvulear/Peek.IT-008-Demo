import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../lib/types';
import { login, ApiResponseError } from '../lib/api';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const user = await login(username.trim());
      onLogin(user);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to connect to server');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Incident Assistant</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in with your team username</p>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., alice"
              autoFocus
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Available users: alice, bob, carol, dave, eve
        </p>
      </div>
    </div>
  );
}
