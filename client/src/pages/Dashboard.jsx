import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileApi, educationApi, skillsApi, projectsApi, experienceApi, certificationsApi, documentsApi, aiApi } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({ skills: 0, projects: 0, experience: 0, certifications: 0 });
  const [profile, setProfile] = useState({});
  const [recentDocs, setRecentDocs] = useState([]);
  const [aiMode, setAiMode] = useState('demo');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      profileApi.get(),
      skillsApi.getAll(),
      projectsApi.getAll(),
      experienceApi.getAll(),
      certificationsApi.getAll(),
      documentsApi.getAll(),
      aiApi.status()
    ]).then(([p, skills, projects, exp, certs, docs, aiStatus]) => {
      setProfile(p);
      setStats({ skills: skills.length, projects: projects.length, experience: exp.length, certifications: certs.length });
      setRecentDocs(docs.slice(0, 5));
      setAiMode(aiStatus.mode);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const completionFields = ['full_name', 'email', 'phone', 'location', 'headline', 'about'];
  const filled = completionFields.filter(f => profile[f]).length;
  const completion = Math.round((filled / completionFields.length) * 100);

  if (loading) return <div className="loading"><div className="spinner"></div><span className="loading-text">Loading dashboard...</span></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back{profile.full_name ? `, ${profile.full_name}` : ''}! Here's your resume builder overview.</p>
      </div>

      {aiMode === 'demo' && (
        <div className="alert alert-warning">
          🤖 <strong>Demo Mode</strong> — AI generation uses stored data without an external AI call. Add <code>AI_API_KEY</code> in <code>server/.env</code> to enable live AI.
        </div>
      )}

      {/* Profile completion */}
      <div className="card">
        <div className="section-header">
          <h2 className="card-title" style={{ margin: 0 }}>Profile Completion</h2>
          <span className="badge badge-primary">{completion}%</span>
        </div>
        <div className="progress-bar" style={{ marginTop: 10 }}>
          <div className="progress-fill" style={{ width: `${completion}%` }}></div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>
          {completion < 100 ? `Complete your profile to get better AI-generated resumes.` : 'Your profile is complete!'}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: '💼', label: 'Skills', value: stats.skills, path: '/profile' },
          { icon: '🚀', label: 'Projects', value: stats.projects, path: '/profile' },
          { icon: '🏢', label: 'Experience', value: stats.experience, path: '/profile' },
          { icon: '🏆', label: 'Certifications', value: stats.certifications, path: '/profile' },
        ].map(s => (
          <Link to={s.path} key={s.label} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="card-title">Quick Actions</h2>
        <div className="quick-actions">
          {[
            { icon: '👤', label: 'Edit Profile', path: '/profile' },
            { icon: '📄', label: 'Build Resume', path: '/resume-builder' },
            { icon: '🤖', label: 'Generate Resume', path: '/ai-generator' },
            { icon: '✉️', label: 'Cover Letter', path: '/cover-letter' },
            { icon: '🌐', label: 'Build Portfolio', path: '/portfolio' },
          ].map(a => (
            <button key={a.label} className="quick-action" onClick={() => navigate(a.path)}>
              <span className="quick-action-icon">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent documents */}
      <div className="card">
        <div className="section-header">
          <h2 className="card-title" style={{ margin: 0 }}>Recent Documents</h2>
          <Link to="/saved-documents" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        {recentDocs.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}>
            <div className="empty-icon">📭</div>
            <div className="empty-title">No documents yet</div>
            <div className="empty-desc">Generate a resume or cover letter to see it here.</div>
          </div>
        ) : (
          recentDocs.map(doc => (
            <div key={doc.id} className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">{doc.title}</div>
                <div className="list-item-subtitle">
                  {doc.type === 'resume' ? '📄 Resume' : '✉️ Cover Letter'} •{' '}
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <Link to="/saved-documents" className="btn btn-ghost btn-sm">View</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
