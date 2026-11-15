import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { toastr } from '../../lib/toast';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      toastr.error(err.message);
    }
  }

  return (
    <section className="hero" style={{ marginTop: 100 }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card auth-card text-center animate-fade-in">
              <div className="card-body p-5">
                <h3 className="fw-bold text-primary mb-3">Admin Portal</h3>
                <p className="text-muted mb-4">Sign in to manage class analysis.</p>
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
                    Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
