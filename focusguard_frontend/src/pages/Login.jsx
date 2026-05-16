import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const inp = {
  width: '100%', background: '#0d120d',
  border: '1px solid #1e2a1e', borderRadius: '8px',
  padding: '10px 14px', color: '#e8f5e8',
  fontSize: '14px', fontFamily: 'Inter, sans-serif',
  outline: 'none', transition: 'border-color 0.15s',
};

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login({ access: res.data.access, refresh: res.data.refresh }, null);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0f1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: '#4ade8016', border: '1px solid #4ade8030',
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
            fontSize: '22px', fontWeight: 600, color: '#4ade80',
          }}>F</div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#e8f5e8', marginBottom: '6px' }}>
            FocusGuard
          </div>
          <div style={{ fontSize: '13px', color: '#4a6741' }}>Sign in to continue</div>
        </div>

        <div style={{
          background: '#141a14', border: '1px solid #1e2a1e',
          borderRadius: '12px', padding: '28px',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#4a6741', marginBottom: '6px', fontWeight: 500 }}>
                Username
              </label>
              <input style={inp} type="text" placeholder="your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#4ade8060'}
                onBlur={e => e.target.style.borderColor = '#1e2a1e'}
                required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#4a6741', marginBottom: '6px', fontWeight: 500 }}>
                Password
              </label>
              <input style={inp} type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#4ade8060'}
                onBlur={e => e.target.style.borderColor = '#1e2a1e'}
                required />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '10px',
              background: loading ? '#1e2a1e' : '#4ade8018',
              color: loading ? '#4a6741' : '#4ade80',
              border: '1px solid #4ade8030',
              borderRadius: '8px', fontSize: '14px', fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
            }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#4a6741' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 500 }}>
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}