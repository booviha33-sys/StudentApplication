import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, User, Lock, Building2, Hash, AlertCircle, ArrowRight } from 'lucide-react';
import { register } from '../api/auth';
import { useToast } from '../context/ToastContext';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [form, setForm] = useState({
    id: '',
    name: '',
    department: '',
    age: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.department.trim() || !form.username.trim() || !form.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    const idNum = Number(form.id);
    const ageNum = Number(form.age);
    if (!form.id || isNaN(idNum) || idNum <= 0) {
      setError('Please enter a valid student ID.');
      return;
    }
    if (!form.age || isNaN(ageNum) || ageNum <= 0) {
      setError('Please enter a valid age.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        id: idNum,
        name: form.name.trim(),
        department: form.department.trim(),
        age: ageNum,
        username: form.username.trim(),
        password: form.password,
      });
      if (res.message === 'Registration Successful') {
        show('Registration successful! Please log in.', 'success');
        navigate('/login');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <div className="auth-logo">
            <GraduationCap size={36} />
          </div>
          <h1>Student Management System</h1>
          <p>Create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="auth-form-grid">
            <div className="auth-field">
              <label>Student ID <span className="req">*</span></label>
              <div className="auth-input-wrap">
                <Hash size={18} />
                <input
                  type="number"
                  value={form.id}
                  onChange={(e) => update('id', e.target.value)}
                  placeholder="e.g. 1"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Full Name <span className="req">*</span></label>
              <div className="auth-input-wrap">
                <User size={18} />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Booviha"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Department <span className="req">*</span></label>
              <div className="auth-input-wrap">
                <Building2 size={18} />
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => update('department', e.target.value)}
                  placeholder="e.g. CSE"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Age <span className="req">*</span></label>
              <div className="auth-input-wrap">
                <Hash size={18} />
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => update('age', e.target.value)}
                  placeholder="e.g. 18"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Username <span className="req">*</span></label>
              <div className="auth-input-wrap">
                <User size={18} />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  placeholder="Choose a username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password <span className="req">*</span></label>
              <div className="auth-input-wrap">
                <Lock size={18} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Choose a password"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
            {!loading && <ArrowRight size={18} />}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
