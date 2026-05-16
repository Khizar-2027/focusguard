import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useWindowSize from '../../hooks/useWindowSize';

const bottomLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '▣' },
  { to: '/streaks',   label: 'Streaks',   icon: '◎' },
  { to: '/squads',    label: 'Squads',    icon: '◈' },
  { to: '/subjects',  label: 'Subjects',  icon: '◉' },
  { to: '/reports',   label: 'Reports',   icon: '◧' },
];

const desktopLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/streaks',   label: 'Streaks' },
  { to: '/squads',    label: 'Squads' },
  { to: '/subjects',  label: 'Subjects' },
  { to: '/reports',   label: 'Reports' },
  { to: '/settings',  label: 'Settings' },
];

export default function Navbar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isMobile } = useWindowSize();

  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: '#0a0f0a',
          borderBottom: '1px solid #1e2a1e',
          padding: '0 16px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link to="/dashboard" style={{
            fontSize: '15px', fontWeight: 600,
            color: '#4ade80', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <span style={{
              width: '22px', height: '22px',
              background: '#4ade8022', border: '1px solid #4ade8044',
              borderRadius: '6px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700,
            }}>F</span>
            FocusGuard
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Settings gear icon */}
            <Link to="/settings" style={{
              width: '32px', height: '32px',
              background: pathname === '/settings' ? '#4ade8018' : '#141a14',
              border: `1px solid ${pathname === '/settings' ? '#4ade8030' : '#1e2a1e'}`,
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', fontSize: '15px',
              color: pathname === '/settings' ? '#4ade80' : '#4a6741',
            }}>⚙</Link>

            {/* Logout */}
            <button onClick={() => { logout(); navigate('/login'); }} style={{
              width: '32px', height: '32px',
              background: '#f8717112', border: '1px solid #f8717122',
              borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '13px', color: '#f87171',
            }}>↩</button>
          </div>
        </div>

        {/* Mobile bottom tab bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#0a0f0a',
          borderTop: '1px solid #1e2a1e',
          zIndex: 100,
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {bottomLinks.map(({ to, label, icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '10px 4px 8px',
                textDecoration: 'none',
                color: active ? '#4ade80' : '#2d4228',
                transition: 'color 0.15s',
              }}>
                <span style={{ fontSize: '16px', lineHeight: 1, marginBottom: '3px' }}>{icon}</span>
                <span style={{ fontSize: '9px', fontWeight: active ? 600 : 400 }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </>
    );
  }

  // Desktop navbar
  return (
    <nav style={{
      background: '#0a0f0a',
      borderBottom: '1px solid #1e2a1e',
      padding: '0 24px',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <Link to="/dashboard" style={{
        fontSize: '15px', fontWeight: 600,
        color: '#4ade80', textDecoration: 'none',
        letterSpacing: '-0.01em',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{
          width: '24px', height: '24px',
          background: '#4ade8022', border: '1px solid #4ade8044',
          borderRadius: '6px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '12px',
        }}>F</span>
        FocusGuard
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {desktopLinks.map(({ to, label }) => {
          const active = pathname === to;
          return (
            <Link key={to} to={to} style={{
              padding: '5px 12px', borderRadius: '6px',
              fontSize: '13px', fontWeight: active ? 500 : 400,
              color: active ? '#4ade80' : '#4a6741',
              background: active ? '#4ade8012' : 'transparent',
              border: active ? '1px solid #4ade8022' : '1px solid transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            }}>{label}</Link>
          );
        })}
      </div>

      <button onClick={() => { logout(); navigate('/login'); }} style={{
        background: '#f8717112', color: '#f87171',
        border: '1px solid #f8717122', borderRadius: '6px',
        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        padding: '5px 14px', fontSize: '12px', fontWeight: 500,
      }}>
        Logout
      </button>
    </nav>
  );
}