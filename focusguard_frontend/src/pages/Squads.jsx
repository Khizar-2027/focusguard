import { useEffect, useState, useCallback, useRef } from 'react';
import { getSquads, createSquad, joinSquad, leaveSquad } from '../api/squads';
import toast from 'react-hot-toast';
import useWindowSize from '../hooks/useWindowSize';

const fmtMins = (s) => `${Math.floor(s / 60)}m`;

export default function Squads() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const { isMobile } = useWindowSize();

  const card = { background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '10px', padding: '18px' };
  const inp = { background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '7px', padding: '8px 12px', color: '#e8f5e8', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none', flex: 1 };

  const fetchSquads = useCallback(async (silent = false) => {
    try {
      const res = await getSquads();
      setSquads(res.data);
      setLastUpdated(new Date());
      if (!activeId && res.data.length > 0) setActiveId(res.data[0].id);
    } catch { if (!silent) toast.error('Failed to load squads'); }
    finally { setLoading(false); }
  }, [activeId]);

  useEffect(() => {
    fetchSquads();
    intervalRef.current = setInterval(() => fetchSquads(true), 60000);
    const reset = () => {
      fetchSquads(true);
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => fetchSquads(true), 60000);
    };
    const onVis = () => { if (!document.hidden) reset(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', reset);
    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', reset);
    };
  }, []);

  const active = squads.find(s => s.id === activeId) || squads[0] || null;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await createSquad(newName.trim());
      toast.success('Squad created');
      setNewName('');
      setActiveId(res.data.id);
      fetchSquads(true);
    } catch { toast.error('Failed'); }
    finally { setCreating(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await joinSquad(joinCode.trim());
      toast.success('Joined squad');
      setJoinCode('');
      setActiveId(res.data.id);
      fetchSquads(true);
    } catch (err) { toast.error(err.response?.data?.error || 'Invalid code'); }
    finally { setJoining(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '13px', color: '#2d4228' }}>Loading squads...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', padding: isMobile ? '16px 14px 80px' : '24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div>
            <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 600, color: '#e8f5e8' }}>Squads</div>
            <div style={{ fontSize: '11px', color: '#2d4228', marginTop: '2px' }}>
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Study together'}
            </div>
          </div>
          <button onClick={() => fetchSquads(false)} style={{ background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', cursor: 'pointer', color: '#4a6741', fontFamily: 'Inter, sans-serif' }}>
            ↻ Refresh
          </button>
        </div>

        {/* Create + Join — stacks on mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={card}>
            <div style={{ fontSize: '12px', color: '#4a6741', fontWeight: 500, marginBottom: '10px' }}>Create squad</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input style={inp} placeholder="Squad name..." value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()} />
              <button onClick={handleCreate} disabled={creating} style={{ background: '#4ade8012', color: '#4ade80', border: '1px solid #4ade8025', borderRadius: '7px', padding: '8px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {creating ? '...' : 'Create'}
              </button>
            </div>
          </div>
          <div style={card}>
            <div style={{ fontSize: '12px', color: '#4a6741', fontWeight: 500, marginBottom: '10px' }}>Join squad</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input style={{ ...inp, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                placeholder="6-digit code..." value={joinCode} maxLength={6}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()} />
              <button onClick={handleJoin} disabled={joining} style={{ background: '#60a5fa12', color: '#60a5fa', border: '1px solid #60a5fa25', borderRadius: '7px', padding: '8px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {joining ? '...' : 'Join'}
              </button>
            </div>
          </div>
        </div>

        {squads.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '13px', color: '#2d4228', marginBottom: '8px' }}>No squads yet</div>
            <div style={{ fontSize: '12px', color: '#1e2a1e' }}>Create one or join with a code</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '200px 1fr', gap: '16px' }}>

            {/* Squad list */}
            <div>
              <div style={{ fontSize: '11px', color: '#1e2a1e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', paddingLeft: '4px' }}>
                Your squads
              </div>
              {squads.map(squad => (
                <div key={squad.id} onClick={() => setActiveId(squad.id)} style={{
                  background: active?.id === squad.id ? '#4ade8010' : '#141a14',
                  border: `1px solid ${active?.id === squad.id ? '#4ade8025' : '#1e2a1e'}`,
                  borderRadius: '8px', padding: '10px 14px', marginBottom: '6px',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: active?.id === squad.id ? '#4ade80' : '#4a6741' }}>{squad.name}</div>
                  <div style={{ fontSize: '11px', color: '#2d4228', marginTop: '2px' }}>{squad.member_count} members</div>
                </div>
              ))}
            </div>

            {/* Squad detail */}
            {active && (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#e8f5e8' }}>{active.name}</div>
                    <div style={{ fontSize: '11px', color: '#2d4228', marginTop: '2px' }}>by {active.created_by_username}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div onClick={() => { navigator.clipboard.writeText(active.code); toast.success('Code copied'); }}
                      style={{ background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', marginBottom: '6px', display: 'inline-block' }}>
                      <span style={{ fontSize: '11px', color: '#2d4228' }}>Code </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4ade80', letterSpacing: '0.1em' }}>{active.code}</span>
                    </div>
                    <div>
                      <button onClick={() => leaveSquad(active.id).then(() => { toast.success('Left squad'); setActiveId(null); fetchSquads(true); }).catch(() => toast.error('Failed'))}
                        style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Leave squad
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#4a6741', fontWeight: 500, marginBottom: '10px' }}>Today's leaderboard</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {[...active.members].sort((a, b) => b.study_today - a.study_today).map((member, i) => {
                    const p = Math.min(100, Math.round((member.study_today / 7200) * 100));
                    return (
                      <div key={member.username} style={{ background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '8px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
                          <span style={{ fontSize: '14px', width: '22px', textAlign: 'center', color: i === 0 ? '#fbbf24' : i === 1 ? '#4a6741' : i === 2 ? '#c9913a' : '#2d4228', fontWeight: 600 }}>
                            {i + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#4a6741' }}>{member.username}</div>
                            <div style={{ fontSize: '11px', color: '#2d4228' }}>🔥 {member.streak}d streak</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#4ade80' }}>{fmtMins(member.study_today)}</div>
                            <div style={{ fontSize: '10px', color: '#2d4228' }}>today</div>
                          </div>
                        </div>
                        <div style={{ background: '#141a14', height: '3px', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${p}%`, background: '#4ade8040', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}