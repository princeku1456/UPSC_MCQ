import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || !user.emailVerified) return <Navigate to="/" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
