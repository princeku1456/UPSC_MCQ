import { useAuth } from '../contexts/AuthContext';

export default function GlobalLoader() {
  const { loading } = useAuth();

  if (!loading) return null;

  return (
    <div id="global-loader" className="global-loader">
      <div className="loader-wrapper">
        <div className="premium-loader">
          <div className="ring"></div>
          <div className="ring"></div>
          <div className="ring"></div>
          <span className="loader-icon">✨</span>
        </div>
        <div className="loader-text-container">
          <h5 className="loader-title">MCQ Practice</h5>
          <div className="loader-status">
            <span className="dot-pulse"></span>
            Initializing secure session
          </div>
        </div>
      </div>
    </div>
  );
}
