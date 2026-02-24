import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { login, register, signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password);
        alert("Account created! Please verify your email before logging in.");
        setIsRegistering(false);
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0 rounded-4" style={{maxWidth: '400px', width: '100%'}}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h1 className="fw-bold text-primary display-6">
              {isRegistering ? 'Create Account' : 'Welcome Back!'}
            </h1>
            <p className="text-muted">
              {isRegistering ? 'Join us to start practicing.' : 'Login to access your dashboard.'}
            </p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold small text-muted">Email Address</label>
              <input
                type="email"
                className="form-control form-control-lg bg-light"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted">Password</label>
              <input
                type="password"
                className="form-control form-control-lg bg-light"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button disabled={loading} className="btn btn-primary w-100 py-3 fw-bold shadow-sm mb-3">
              {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
            </button>
          </form>

          <div className="text-center mb-3">
            <small className="text-muted fw-bold">OR</small>
          </div>

          <button onClick={handleGoogleSignIn} disabled={loading} className="btn btn-outline-secondary w-100 py-2 fw-bold mb-4 d-flex align-items-center justify-content-center gap-2">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
            Continue with Google
          </button>

          <div className="text-center">
            <small className="text-muted">
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              <button
                className="btn btn-link p-0 fw-bold text-decoration-none"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? 'Login here' : 'Register here'}
              </button>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
