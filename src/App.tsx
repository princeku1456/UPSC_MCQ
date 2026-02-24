import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Quiz } from './pages/Quiz';
import { Practice } from './pages/Practice';
import { Admin } from './pages/Admin';
import './styles/main.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
             <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/admin" element={<Admin />} />
             </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
