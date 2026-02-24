import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!currentUser) {
      return <Outlet />;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            <i className="bi bi-mortarboard-fill me-2"></i>UPSC MCQ
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname.startsWith('/quiz') ? 'active' : ''}`} to="/quiz">Take Quiz</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname.startsWith('/practice') ? 'active' : ''}`} to="/practice">Practice</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`} to="/admin">Admin</Link>
              </li>
            </ul>
            <div className="d-flex align-items-center text-white">
              <span className="me-3 small">
                {currentUser.displayName || currentUser.email}
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4 flex-grow-1">
        <Outlet />
      </main>

      <footer className="bg-light py-3 mt-auto text-center border-top">
        <div className="container">
          <small className="text-muted">© 2024 UPSC MCQ Prep. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
};
