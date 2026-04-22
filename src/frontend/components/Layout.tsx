import { Outlet, useNavigate } from 'react-router-dom';
import type { User } from '../lib/types';
import { logout } from '../lib/api';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

export function Layout({ user, onLogout }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-lg font-bold text-gray-900 cursor-pointer"
              onClick={() => navigate('/')}
            >
              Incident Assistant
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Signed in as <strong>{user.display_name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
