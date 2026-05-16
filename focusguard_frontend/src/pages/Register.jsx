import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import toast from 'react-hot-toast';

const inp = {
  width: '100%', background: '#0d120d',
  border: '1px solid #1e2a1e', borderRadius: '8px',
  padding: '10px 14px', color: '#e8f5e8',
  fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none',
};

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    daily_study_goal: 120, daily_reels_limit: 60,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      toast.success('Account created! Sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.username?.[0] || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0f1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', background: '#4ade8016',
            border: '1px solid #4ade8030', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '22px', fontWeight: 600, color: '#4ade80',
          }}>F</div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#e8f5e8', marginBottom: '6px' }}>
            Create account
          </div>
          <div style={{ fontSize: '13px', color: '#4a6741' }}>Join FocusGuard</div>
        </div>

        <div style={{ background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '12px', padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Username', key: 'username', type: 'text', placeholder: 'your username' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@email.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#4a6741', marginBottom: '6px', fontWeight: 500 }}>
                  {label}
                </label>
                <input style={inp} type={type} placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })
                  } required />
              </div>
            ))}

            <div style={{ background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#4a6741', fontWeight: 500, marginBottom: '14px' }}>Daily goals</div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#4a6741' }}>Study goal</span>
                  <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 500 }}>{form.daily_study_goal}m</span>
                </div>
                <input type="range" min="30" max="480" step="15"
                  value={form.daily_study_goal}
                  onChange={e => setForm({ ...form, daily_study_goal: parseInt(e.target.value) })} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#4a6741' }}>Reels limit</span>
                  <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 500 }}>{form.daily_reels_limit}m</span>
                </div>
                <input type="range" min="5" max="180" step="5"
                  value={form.daily_reels_limit}
                  onChange={e => setForm({ ...form, daily_reels_limit: parseInt(e.target.value) })} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '10px',
              background: loading ? '#1e2a1e' : '#4ade8018',
              color: loading ? '#4a6741' : '#4ade80',
              border: '1px solid #4ade8030',
              borderRadius: '8px', fontSize: '14px', fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#4a6741' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}