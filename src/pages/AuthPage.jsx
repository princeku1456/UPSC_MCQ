import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toastr } from '../lib/toast';

export default function AuthPage() {
  const { user, login, register, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && user.emailVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const isRegistering = mode === 'register';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toastr.warning('Please enter both email and password.');
      return;
    }
    if (isRegistering) await register(email, password);
    else await login(email, password);
  }

  return (
    <section className="hero" style={{ marginTop: 100 }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="card auth-card text-center animate-fade-in">
              <div className="card-body p-5">
                <h3 className="fw-bold text-primary mb-2">
                  {isRegistering ? 'Create Account' : 'Welcome Back! 👋'}
                </h3>
                <p className="text-muted mb-4">
                  {isRegistering
                    ? 'Join us to start practicing.'
                    : 'Login to access your dashboard.'}
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3 text-start">
                    <label className="form-label text-muted small fw-bold">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3 text-start">
                    <label className="form-label text-muted small fw-bold">Password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary-custom w-100 py-3 mt-3 shadow">
                    {isRegistering ? 'Register' : 'Login'}
                  </button>
                </form>

                <div>
                  <div className="d-flex align-items-center my-4">
                    <hr className="flex-grow-1" />
                    <span className="mx-2 text-muted small">OR</span>
                    <hr className="flex-grow-1" />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={googleSignIn}
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      width="18"
                      alt="Google"
                    />
                    Continue with Google
                  </button>
                </div>

                <div className="mt-4">
                  <small className="text-muted">
                    {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                      type="button"
                      className="btn btn-link text-primary fw-bold text-decoration-none p-0"
                      onClick={() => setMode(isRegistering ? 'login' : 'register')}
                    >
                      {isRegistering ? 'Login here' : 'Register here'}
                    </button>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
