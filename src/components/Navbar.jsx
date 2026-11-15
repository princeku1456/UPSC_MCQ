import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, theme, toggleTheme, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.email ? user.email.split('@')[0] : 'User';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark main-navbar sticky-top">
      <div className="container">
        <button
          className="navbar-brand fw-bold btn btn-link text-white text-decoration-none p-0"
          onClick={() => navigate('/dashboard')}
          type="button"
        >
          ✨ MCQ Practice
        </button>
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
            onClick={toggleTheme}
            style={{ width: 38, height: 38, fontSize: '1.2rem' }}
            title="Toggle Theme"
            type="button"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user && (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="btn btn-link text-white text-decoration-none fw-bold"
                id="user-profile-dropdown"
              >
                {name}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/dashboard')}>
                  📊 Dashboard
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item className="text-danger" onClick={logout}>
                  🚪 Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    </nav>
  );
}
