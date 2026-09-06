import { useApp } from '../context/AppContext.jsx';

export default function Navbar() {
  const { currentUser, toggleTheme, theme, showDashboard, logoutUser } = useApp();

  const userName = currentUser ? currentUser.email.split('@')[0] : 'User';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark main-navbar sticky-top">
      <div className="container">
        <a className="navbar-brand fw-bold" href="#" onClick={(e) => { e.preventDefault(); currentUser ? showDashboard() : null; }}>
          ✨ MCQ Practice
        </a>
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
            onClick={toggleTheme}
            style={{ width: 38, height: 38, fontSize: '1.2rem' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {currentUser && (
            <div className="dropdown">
              <button className="btn btn-link text-white text-decoration-none dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
                <span>{userName}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); showDashboard(); }}>
                    📊 Dashboard
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); logoutUser(); }}>
                    🚪 Logout
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
