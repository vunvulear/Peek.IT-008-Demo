import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './lib/types';
import { getMe } from './lib/api';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    getMe()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            currentUser
              ? <Navigate to="/" replace />
              : <LoginPage onLogin={(user) => setCurrentUser(user)} />
          }
        />
        <Route
          element={
            currentUser
              ? <Layout user={currentUser} onLogout={() => setCurrentUser(null)} />
              : <Navigate to="/login" replace />
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
