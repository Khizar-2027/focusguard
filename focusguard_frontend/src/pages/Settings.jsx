import { useEffect, useState } from 'react';
import { getProfile, updateProfile, updateSites, updatePomodoro } from '../api/auth';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import useWindowSize from '../hooks/useWindowSize';

function SiteTag({ site, color, onRemove }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: color === 'red' ? '#f8717112' : '#4ade8012', border: `1px solid ${color === 'red' ? '#f8717125' : '#4ade8025'}`, borderRadius: '20px', padding: '3px 10px 3px 12px', fontSize: '12px', color: color === 'red' ? '#f87171' : '#4ade80', margin: '3px' }}>
      {site}
      <button onClick={() => onRemove(site)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: color === 'red' ? '#f87171' : '#4ade80', fontSize: '13px', lineHeight: 1, padding: '0 2px', fontFamily: 'Inter, sans-serif' }}>×</button>
    </div>
  );
}

function SitesSection({ title, sites, color, description, onAdd, onRemove, placeholder }) {
  const [val, setVal] = useState('');
  const inp = { width: '100%', background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '7px', padding: '8px 12px', color: '#e8f5e8', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' };

  const handleAdd = () => {
    const clean = val.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!clean) return;
    if (sites.includes(clean)) { toast.error('Already in list'); return; }
    onAdd(clean); setVal('');
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#4a6741', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#2d4228', marginBottom: '10px', lineHeight: 1.5 }}>{description}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '8px', padding: '8px', minHeight: '44px', marginBottom: '8px' }}>
        {sites.length === 0
          ? <span style={{ fontSize: '12px', color: '#1e2a1e', padding: '2px 4px' }}>No sites added</span>
          : sites.map(s => <SiteTag key={s} site={s} color={color} onRemove={onRemove} />)}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input style={inp} value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder={placeholder} />
        <button onClick={handleAdd} style={{ background: color === 'red' ? '#f8717112' : '#4ade8012', border: `1px solid ${color === 'red' ? '#f8717125' : '#4ade8025'}`, borderRadius: '7px', padding: '8px 14px', fontSize: '12px', fontWeight: 500, color: color === 'red' ? '#f87171' : '#4ade80', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
          + Add
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ daily_study_goal: 120, daily_reels_limit: 60 });
  const [distraction, setDistraction] = useState([]);
  const [productive, setProductive] = useState([]);
  const [pomForm, setPomForm] = useState({ pomodoro_work_minutes: 45, pomodoro_break_minutes: 10, playlist_url: '' });
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingPom, setLoadingPom] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  const card = { background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '10px', padding: '20px', marginBottom: '12px' };
  const label = { fontSize: '11px', color: '#2d4228', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' };
  const inp = { width: '100%', background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '7px', padding: '8px 12px', color: '#e8f5e8', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' };

  useEffect(() => {
    getProfile().then(res => {
      setProfile(res.data);
      setForm({ daily_study_goal: res.data.daily_study_goal, daily_reels_limit: res.data.daily_reels_limit });
      setDistraction(res.data.distraction_sites_list || []);
      setProductive(res.data.productive_sites_list || []);
      setPomForm({
        pomodoro_work_minutes: res.data.pomodoro_work_minutes || 45,
        pomodoro_break_minutes: res.data.pomodoro_break_minutes || 10,
        playlist_url: res.data.playlist_url || '',
      });
    }).catch(console.error);
  }, []);

  const saveGoals = async () => {
    setLoadingGoals(true);
    try { await updateProfile(form); toast.success('Goals saved'); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoadingGoals(false); }
  };

  const saveSites = async () => {
    setLoadingSites(true);
    try {
      await updateSites({ distraction_sites: distraction, productive_sites: productive });
      try { window.postMessage({ type: 'FOCUSGUARD_UPDATE_SITES', distraction_sites: distraction, productive_sites: productive }, '*'); } catch {}
      toast.success('Sites saved');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoadingSites(false); }
  };

  const savePom = async () => {
    setLoadingPom(true);
    try { await updatePomodoro(pomForm); toast.success('Pomodoro settings saved'); }
    catch { toast.error('Failed'); }
    finally { setLoadingPom(false); }
  };

  const btn = (loading, label, color = '#4ade80') => ({
    width: '100%', padding: '10px', marginTop: '4px',
    background: loading ? '#1e2a1e' : `${color}12`,
    color: loading ? '#2d4228' : color,
    border: `1px solid ${loading ? '#1e2a1e' : `${color}25`}`,
    borderRadius: '8px', fontSize: '13px', fontWeight: 500,
    cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', padding: isMobile ? '16px 14px 80px' : '24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 600, color: '#e8f5e8' }}>Settings</div>
          <div style={{ fontSize: '11px', color: '#2d4228', marginTop: '2px' }}>Manage your account and preferences</div>
        </div>

        {/* Profile */}
        {profile && (
          <div style={card}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#4a6741', marginBottom: '14px' }}>Profile</div>
            {[
              { label: 'Username', value: profile.username },
              { label: 'Email', value: profile.email },
              { label: 'Member since', value: new Date(profile.created_at).toLocaleDateString('en-IN') },
            ].map(({ label: l, value }, i, arr) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i === arr.length - 1 ? 'none' : '1px solid #0d120d' }}>
                <span style={{ fontSize: '12px', color: '#2d4228' }}>{l}</span>
                <span style={{ fontSize: '13px', color: '#4a6741', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Goals */}
        <div style={card}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#4a6741', marginBottom: '18px' }}>Daily goals</div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={label}>Study goal</span>
              <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 500 }}>{form.daily_study_goal}m</span>
            </div>
            <input type="range" min="30" max="480" step="15" value={form.daily_study_goal}
              onChange={e => setForm({ ...form, daily_study_goal: parseInt(e.target.value) })} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={label}>Reels limit</span>
              <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 500 }}>{form.daily_reels_limit}m</span>
            </div>
            <input type="range" min="5" max="180" step="5" value={form.daily_reels_limit}
              onChange={e => setForm({ ...form, daily_reels_limit: parseInt(e.target.value) })} />
          </div>
          <button onClick={saveGoals} disabled={loadingGoals} style={btn(loadingGoals, 'Save goals')}>
            {loadingGoals ? 'Saving...' : 'Save goals'}
          </button>
        </div>

        {/* Pomodoro */}
        <div style={card}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#4a6741', marginBottom: '18px' }}>Pomodoro timer</div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={label}>Work session</span>
              <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 500 }}>{pomForm.pomodoro_work_minutes}m</span>
            </div>
            <input type="range" min="10" max="120" step="5" value={pomForm.pomodoro_work_minutes}
              onChange={e => setPomForm({ ...pomForm, pomodoro_work_minutes: parseInt(e.target.value) })} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={label}>Break duration</span>
              <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 500 }}>{pomForm.pomodoro_break_minutes}m</span>
            </div>
            <input type="range" min="5" max="30" step="5" value={pomForm.pomodoro_break_minutes}
              onChange={e => setPomForm({ ...pomForm, pomodoro_break_minutes: parseInt(e.target.value) })} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <span style={label}>Break playlist URL</span>
            <input style={inp} type="url" placeholder="https://open.spotify.com/playlist/..."
              value={pomForm.playlist_url}
              onChange={e => setPomForm({ ...pomForm, playlist_url: e.target.value })} />
            <div style={{ fontSize: '11px', color: '#1e2a1e', marginTop: '5px' }}>Opens automatically when your break starts</div>
          </div>
          <button onClick={savePom} disabled={loadingPom} style={btn(loadingPom, 'Save', '#fbbf24')}>
            {loadingPom ? 'Saving...' : 'Save pomodoro settings'}
          </button>
        </div>

        {/* Sites */}
        <div style={card}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#4a6741', marginBottom: '6px' }}>Tracked sites</div>
          <div style={{ fontSize: '12px', color: '#2d4228', marginBottom: '18px' }}>Syncs to the Chrome extension automatically</div>
          <SitesSection title="Distraction sites" sites={distraction} color="red"
            description="Extension auto-tracks time on these as Reels/distraction."
            placeholder="e.g. reddit.com"
            onAdd={s => setDistraction(p => [...p, s])}
            onRemove={s => setDistraction(p => p.filter(x => x !== s))} />
          <div style={{ height: '1px', background: '#1e2a1e', margin: '4px 0 20px' }} />
          <SitesSection title="Productive sites" sites={productive} color="green"
            description="Extension auto-starts study timer when you visit these."
            placeholder="e.g. coursera.org"
            onAdd={s => setProductive(p => [...p, s])}
            onRemove={s => setProductive(p => p.filter(x => x !== s))} />
          <button onClick={saveSites} disabled={loadingSites} style={btn(loadingSites, 'Save sites')}>
            {loadingSites ? 'Saving...' : 'Save sites & sync extension'}
          </button>
        </div>

        {/* Logout */}
        <div style={{ ...card, border: '1px solid #f8717120', background: '#f8717108' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#f87171', marginBottom: '14px' }}>Account</div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ width: '100%', padding: '10px', background: '#f8717112', color: '#f87171', border: '1px solid #f8717125', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}