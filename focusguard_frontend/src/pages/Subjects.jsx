import { useEffect, useState } from 'react';
import {
  getSubjects, createSubject, updateSubject, deleteSubject, logSubjectSession,
  getExams, createExam, deleteExam
} from '../api/subjects';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import useWindowSize from '../hooks/useWindowSize';

const COLORS = ['#4ade80', '#f87171', '#fbbf24', '#60a5fa', '#c084fc', '#f97316', '#34d399', '#e879f9'];

const fmtHours = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const daysColor = (d) => d <= 3 ? '#f87171' : d <= 7 ? '#fbbf24' : d <= 14 ? '#f97316' : '#4ade80';

const card = { background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '10px', padding: '16px' };
const inp = { width: '100%', background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '7px', padding: '8px 12px', color: '#e8f5e8', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' };
const sel = { ...inp, cursor: 'pointer' };

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [activeTab, setActiveTab] = useState('subjects');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', color: '#4ade80', target_hours: 10 });
  const [examForm, setExamForm] = useState({ name: '', exam_date: '', subject: '', notes: '' });
  const [logModal, setLogModal] = useState(null);
  const [logMinutes, setLogMinutes] = useState(30);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editingExamId, setEditingExamId] = useState(null);
  const [editExamName, setEditExamName] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const { isMobile } = useWindowSize();

  const fetchAll = async () => {
    try {
      const [subRes, exRes] = await Promise.all([getSubjects(), getExams()]);
      setSubjects(subRes.data);
      setExams(exRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateSubject = async () => {
    if (!subjectForm.name.trim()) { toast.error('Enter a subject name'); return; }
    try {
      await createSubject(subjectForm);
      toast.success('Subject created');
      setSubjectForm({ name: '', color: '#4ade80', target_hours: 10 });
      setShowSubjectForm(false);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteSubject = (id) => {
    setConfirmDialog({
      message: 'This will permanently delete the subject and all its logged sessions.',
      onConfirm: async () => {
        try { await deleteSubject(id); toast.success('Deleted'); setConfirmDialog(null); fetchAll(); }
        catch { toast.error('Failed'); }
      }
    });
  };

  const handleSaveSubjectEdit = async (id) => {
    if (!editSubjectName.trim()) return;
    try {
      await updateSubject(id, { name: editSubjectName.trim() });
      toast.success('Updated');
      setEditingSubjectId(null);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleLogSession = async () => {
    if (!logModal) return;
    try {
      await logSubjectSession(logModal, logMinutes * 60);
      toast.success('Session logged');
      setLogModal(null);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleCreateExam = async () => {
    if (!examForm.name.trim() || !examForm.exam_date) { toast.error('Name and date required'); return; }
    try {
      await createExam({ ...examForm, subject: examForm.subject || null });
      toast.success('Exam added');
      setExamForm({ name: '', exam_date: '', subject: '', notes: '' });
      setShowExamForm(false);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteExam = (id) => {
    setConfirmDialog({
      message: 'This will permanently remove this exam.',
      onConfirm: async () => {
        try { await deleteExam(id); toast.success('Removed'); setConfirmDialog(null); fetchAll(); }
        catch { toast.error('Failed'); }
      }
    });
  };

  const handleSaveExamEdit = async (id) => {
    if (!editExamName.trim() || !editExamDate) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`http://127.0.0.1:8000/api/subjects/exams/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editExamName.trim(), exam_date: editExamDate }),
      });
      toast.success('Exam updated');
      setEditingExamId(null);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', padding: '24px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#e8f5e8' }}>Subjects & Exams</div>
          <div style={{ fontSize: '11px', color: '#2d4228', marginTop: '2px' }}>Track study hours and upcoming exams</div>
        </div>

        {/* Exam countdown banner */}
        {exams.length > 0 && (
          <div style={{ ...card, marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#2d4228', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Upcoming exams</div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {exams.slice(0, 6).map(exam => (
                <div key={exam.id} style={{ flexShrink: 0, background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '8px', padding: '10px 14px', minWidth: '110px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#4a6741', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{exam.name}</div>
                  {exam.subject_name && <div style={{ fontSize: '10px', color: exam.subject_color, marginBottom: '6px' }}>{exam.subject_name}</div>}
                  <div style={{ fontSize: '20px', fontWeight: 700, color: daysColor(exam.days_left), lineHeight: 1 }}>
                    {exam.days_left === 0 ? 'Today' : `${exam.days_left}d`}
                  </div>
                  <div style={{ fontSize: '10px', color: '#1e2a1e', marginTop: '3px' }}>{exam.exam_date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#0d120d', padding: '3px', borderRadius: '8px', width: 'fit-content', marginBottom: '18px' }}>
          {[{ id: 'subjects', label: 'Subjects' }, { id: 'exams', label: 'Exams' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '7px 20px', borderRadius: '6px', border: 'none',
              fontSize: '12px', fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              background: activeTab === tab.id ? '#1e2a1e' : 'transparent',
              color: activeTab === tab.id ? '#4ade80' : '#2d4228',
              transition: 'all 0.15s',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── SUBJECTS TAB ── */}
        {activeTab === 'subjects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
              <button onClick={() => setShowSubjectForm(!showSubjectForm)} style={{
                background: showSubjectForm ? '#f8717112' : '#4ade8012',
                color: showSubjectForm ? '#f87171' : '#4ade80',
                border: `1px solid ${showSubjectForm ? '#f8717122' : '#4ade8022'}`,
                borderRadius: '7px', padding: '7px 16px', fontSize: '12px',
                fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>{showSubjectForm ? '✕ Cancel' : '+ Add Subject'}</button>
            </div>

            {showSubjectForm && (
              <div style={{ ...card, marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#4a6741', marginBottom: '14px' }}>New subject</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#2d4228', marginBottom: '6px' }}>Subject name</div>
                    <input style={inp} placeholder="e.g. Physics, Math..." value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#2d4228' }}>Study goal</span>
                      <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 500 }}>{subjectForm.target_hours}h</span>
                    </div>
                    <input type="range" min="1" max="200" step="1" value={subjectForm.target_hours} onChange={e => setSubjectForm({ ...subjectForm, target_hours: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#2d4228', marginBottom: '8px' }}>Color</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setSubjectForm({ ...subjectForm, color: c })} style={{
                          width: '24px', height: '24px', borderRadius: '50%', background: c,
                          border: 'none', cursor: 'pointer',
                          outline: subjectForm.color === c ? '2px solid #e8f5e8' : '2px solid transparent',
                          outlineOffset: '2px', transition: 'transform 0.15s',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCreateSubject} style={{ background: '#4ade8012', color: '#4ade80', border: '1px solid #4ade8022', borderRadius: '7px', padding: '8px 18px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Create</button>
                  <button onClick={() => setShowSubjectForm(false)} style={{ background: 'transparent', color: '#2d4228', border: '1px solid #1e2a1e', borderRadius: '7px', padding: '8px 18px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                </div>
              </div>
            )}

            {subjects.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '13px', color: '#2d4228', marginBottom: '6px' }}>No subjects yet</div>
                <div style={{ fontSize: '12px', color: '#1e2a1e' }}>Add your first subject to track study hours</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {subjects.map(subject => (
                  <div key={subject.id} style={{ ...card, padding: '16px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject.color, flexShrink: 0 }} />
                        {editingSubjectId === subject.id ? (
                          <input value={editSubjectName} onChange={e => setEditSubjectName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveSubjectEdit(subject.id)}
                            autoFocus style={{ ...inp, padding: '3px 8px', fontSize: '13px', width: '120px' }} />
                        ) : (
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#e8f5e8' }}>{subject.name}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {editingSubjectId === subject.id ? (
                          <>
                            <button onClick={() => handleSaveSubjectEdit(subject.id)} style={{ background: '#4ade8012', border: '1px solid #4ade8022', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', color: '#4ade80', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Save</button>
                            <button onClick={() => setEditingSubjectId(null)} style={{ background: 'transparent', border: '1px solid #1e2a1e', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', color: '#2d4228', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>✕</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingSubjectId(subject.id); setEditSubjectName(subject.name); }} style={{ background: 'transparent', border: 'none', color: '#2d4228', cursor: 'pointer', fontSize: '13px', padding: '2px 4px' }}>✏</button>
                            <button onClick={() => handleDeleteSubject(subject.id)} style={{ background: 'transparent', border: 'none', color: '#2d4228', cursor: 'pointer', fontSize: '13px', padding: '2px 4px' }}>✕</button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#2d4228' }}>{fmtHours(subject.total_studied)} studied</span>
                        <span style={{ fontSize: '11px', color: '#1e2a1e' }}>Goal: {subject.target_hours}h</span>
                      </div>
                      <div style={{ background: '#0d120d', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${subject.progress_percent}%`, background: subject.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: subject.color }}>{subject.progress_percent}%</span>
                        <span style={{ fontSize: '11px', color: '#1e2a1e' }}>{Math.max(0, subject.target_hours - Math.floor(subject.total_studied / 3600))}h left</span>
                      </div>
                    </div>

                    {/* Linked exams */}
                    {subject.exams?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                        {subject.exams.map(exam => (
                          <span key={exam.id} style={{ fontSize: '10px', background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '5px', padding: '2px 8px', color: '#2d4228', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            {exam.name}
                            <span style={{ fontWeight: 600, color: daysColor(exam.days_left) }}>
                              {exam.days_left === 0 ? 'Today' : `${exam.days_left}d`}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    <button onClick={() => { setLogModal(subject.id); setLogMinutes(30); }} style={{ width: '100%', padding: '8px', background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '7px', fontSize: '12px', fontWeight: 500, color: '#4a6741', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
                      + Log Study Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── EXAMS TAB ── */}
        {activeTab === 'exams' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
              <button onClick={() => setShowExamForm(!showExamForm)} style={{
                background: showExamForm ? '#f8717112' : '#4ade8012',
                color: showExamForm ? '#f87171' : '#4ade80',
                border: `1px solid ${showExamForm ? '#f8717122' : '#4ade8022'}`,
                borderRadius: '7px', padding: '7px 16px', fontSize: '12px',
                fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>{showExamForm ? '✕ Cancel' : '+ Add Exam'}</button>
            </div>

            {showExamForm && (
              <div style={{ ...card, marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#4a6741', marginBottom: '14px' }}>New exam</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#2d4228', marginBottom: '5px' }}>Exam name</div>
                    <input style={inp} placeholder="e.g. Physics Final" value={examForm.name} onChange={e => setExamForm({ ...examForm, name: e.target.value })} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#2d4228', marginBottom: '5px' }}>Exam date</div>
                    <input type="date" style={{ ...inp, colorScheme: 'dark' }} value={examForm.exam_date} onChange={e => setExamForm({ ...examForm, exam_date: e.target.value })} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#2d4228', marginBottom: '5px' }}>Linked subject</div>
                    <select style={sel} value={examForm.subject} onChange={e => setExamForm({ ...examForm, subject: e.target.value })}>
                      <option value="">No subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#2d4228', marginBottom: '5px' }}>Notes (optional)</div>
                    <input style={inp} placeholder="e.g. Chapters 1-5" value={examForm.notes} onChange={e => setExamForm({ ...examForm, notes: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCreateExam} style={{ background: '#4ade8012', color: '#4ade80', border: '1px solid #4ade8022', borderRadius: '7px', padding: '8px 18px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Add Exam</button>
                  <button onClick={() => setShowExamForm(false)} style={{ background: 'transparent', color: '#2d4228', border: '1px solid #1e2a1e', borderRadius: '7px', padding: '8px 18px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                </div>
              </div>
            )}

            {exams.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '13px', color: '#2d4228', marginBottom: '6px' }}>No exams added</div>
                <div style={{ fontSize: '12px', color: '#1e2a1e' }}>Add upcoming exams to see countdowns</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {exams.map(exam => (
                  <div key={exam.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px' }}>

                    {/* Countdown */}
                    <div style={{ textAlign: 'center', minWidth: '52px', background: '#0d120d', border: '1px solid #1e2a1e', borderRadius: '8px', padding: '8px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: daysColor(exam.days_left), lineHeight: 1 }}>
                        {exam.days_left === 0 ? '!' : exam.days_left < 0 ? '✓' : exam.days_left}
                      </div>
                      <div style={{ fontSize: '9px', color: '#2d4228', marginTop: '2px' }}>
                        {exam.days_left === 0 ? 'today' : exam.days_left < 0 ? 'done' : 'days'}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {editingExamId === exam.id ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <input value={editExamName} onChange={e => setEditExamName(e.target.value)} style={{ ...inp, width: '150px', padding: '5px 8px', fontSize: '12px' }} />
                          <input type="date" value={editExamDate} onChange={e => setEditExamDate(e.target.value)} style={{ ...inp, width: '130px', padding: '5px 8px', fontSize: '12px', colorScheme: 'dark' }} />
                          <button onClick={() => handleSaveExamEdit(exam.id)} style={{ background: '#4ade8012', border: '1px solid #4ade8022', borderRadius: '5px', padding: '4px 10px', fontSize: '11px', color: '#4ade80', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Save</button>
                          <button onClick={() => setEditingExamId(null)} style={{ background: 'transparent', border: '1px solid #1e2a1e', borderRadius: '5px', padding: '4px 10px', fontSize: '11px', color: '#2d4228', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#4a6741', marginBottom: '3px' }}>{exam.name}</div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {exam.subject_name && <span style={{ fontSize: '11px', color: exam.subject_color }}>{exam.subject_name}</span>}
                            <span style={{ fontSize: '11px', color: '#2d4228' }}>{exam.exam_date}</span>
                            {exam.notes && <span style={{ fontSize: '11px', color: '#1e2a1e' }}>{exam.notes}</span>}
                          </div>
                        </>
                      )}
                    </div>

                    {editingExamId !== exam.id && (
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button onClick={() => { setEditingExamId(exam.id); setEditExamName(exam.name); setEditExamDate(exam.exam_date); }} style={{ background: 'transparent', border: 'none', color: '#2d4228', cursor: 'pointer', fontSize: '13px', padding: '4px' }}>✏</button>
                        <button onClick={() => handleDeleteExam(exam.id)} style={{ background: 'transparent', border: 'none', color: '#2d4228', cursor: 'pointer', fontSize: '13px', padding: '4px' }}>✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Log Session Modal */}
        {logModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: '#141a14', border: '1px solid #1e2a1e', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '340px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#e8f5e8', marginBottom: '4px' }}>Log Study Session</div>
              <div style={{ fontSize: '12px', color: '#2d4228', marginBottom: '20px' }}>{subjects.find(s => s.id === logModal)?.name}</div>
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#4a6741' }}>Duration</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#4ade80' }}>{logMinutes} minutes</span>
                </div>
                <input type="range" min="5" max="300" step="5" value={logMinutes} onChange={e => setLogMinutes(parseInt(e.target.value))} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#1e2a1e', marginTop: '5px' }}>
                  <span>5m</span><span>1h</span><span>2h</span><span>3h</span><span>5h</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleLogSession} style={{ flex: 1, padding: '10px', background: '#4ade8012', color: '#4ade80', border: '1px solid #4ade8022', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Log Session</button>
                <button onClick={() => setLogModal(null)} style={{ flex: 1, padding: '10px', background: 'transparent', color: '#2d4228', border: '1px solid #1e2a1e', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm dialog */}
        {confirmDialog && (
          <ConfirmDialog
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}

      </div>
    </div>
  );
}