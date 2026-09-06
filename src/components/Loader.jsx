import { useApp } from '../context/AppContext.jsx';

export default function Loader({ hidden }) {
  return (
    <div id="global-loader" className={`global-loader${hidden ? ' loader-hidden' : ''}`} style={hidden ? { display: 'none' } : undefined}>
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
