import React, { useState, useEffect } from 'react';
import { aiApi } from '../services/api';

function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('preview');

  useEffect(() => {
    aiApi.getPortfolioData()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handlePrint() {
    window.print();
  }

  if (loading) return <div className="loading"><div className="spinner"></div><span className="loading-text">Loading portfolio data...</span></div>;
  if (error) return <div className="alert alert-error">❌ {error}</div>;

  const { profile, education, skills, projects, experience, certifications } = data;
  const techSkills = skills.filter(s => s.category === 'technical');
  const links = data.links || [];
  const githubLink = links.find(l => l.platform?.toLowerCase() === 'github');
  const linkedinLink = links.find(l => l.platform?.toLowerCase() === 'linkedin');

  const hasContent = profile.full_name || projects.length > 0 || skills.length > 0;

  if (!hasContent) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Portfolio Builder</h1>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🌐</div>
            <div className="empty-title">Your portfolio is empty</div>
            <div className="empty-desc">Add your profile information, projects, and skills first to generate a portfolio.</div>
            <a href="/profile" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Profile</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Portfolio Preview</h1>
        <p className="page-subtitle">A professional portfolio generated from your profile data.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <button className="btn btn-secondary btn-sm" onClick={handlePrint}>🖨️ Print / Save as PDF</button>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Data automatically pulled from your profile</span>
      </div>

      {/* Portfolio Preview */}
      <div className="portfolio-preview">
        {/* Hero */}
        <div className="portfolio-hero">
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <h1>{profile.full_name || 'Your Name'}</h1>
            {profile.headline && <p style={{ fontSize: 18, opacity: 0.9, marginTop: 8 }}>{profile.headline}</p>}
            {profile.location && <p style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>📍 {profile.location}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
              {profile.email && <a href={`mailto:${profile.email}`} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: 14 }}>✉️ {profile.email}</a>}
              {githubLink && <a href={githubLink.url} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: 14 }}>💻 GitHub</a>}
              {linkedinLink && <a href={linkedinLink.url} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: 14 }}>🔗 LinkedIn</a>}
            </div>
          </div>
        </div>

        {/* About */}
        {profile.about && (
          <div className="portfolio-section">
            <h2 className="portfolio-section-title">About Me</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-text)', maxWidth: 700 }}>{profile.about}</p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="portfolio-section">
            <h2 className="portfolio-section-title">Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {techSkills.map(s => (
                <span key={s.id} className="skill-tag skill-technical" style={{ fontSize: 14, padding: '6px 16px' }}>{s.name}</span>
              ))}
              {skills.filter(s => s.category === 'tools').map(s => (
                <span key={s.id} className="skill-tag skill-tools" style={{ fontSize: 14, padding: '6px 16px' }}>{s.name}</span>
              ))}
              {skills.filter(s => s.category === 'soft').map(s => (
                <span key={s.id} className="skill-tag skill-soft" style={{ fontSize: 14, padding: '6px 16px' }}>{s.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="portfolio-section">
            <h2 className="portfolio-section-title">Projects</h2>
            <div className="portfolio-projects-grid">
              {projects.map(p => (
                <div key={p.id} className="portfolio-project-card">
                  <div className="portfolio-project-name">{p.name}</div>
                  {p.description && <div className="portfolio-project-desc">{p.description}</div>}
                  {p.technologies && <div className="portfolio-project-tech">🔧 {p.technologies}</div>}
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">GitHub</a>}
                    {p.project_url && <a href={p.project_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Live Demo</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="portfolio-section">
            <h2 className="portfolio-section-title">Experience</h2>
            {experience.map(e => (
              <div key={e.id} style={{ marginBottom: 20, paddingLeft: 16, borderLeft: '3px solid var(--color-primary)' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{e.role}</div>
                <div style={{ color: 'var(--color-primary)', fontSize: 14, marginTop: 2 }}>{e.company}{e.location ? ` • ${e.location}` : ''}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {e.start_date}{e.is_current ? ' — Present' : e.end_date ? ` — ${e.end_date}` : ''}
                </div>
                {e.responsibilities && <p style={{ marginTop: 8, fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{e.responsibilities.split('\n')[0]}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="portfolio-section">
            <h2 className="portfolio-section-title">Education</h2>
            {education.map(e => (
              <div key={e.id} style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{e.degree}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{e.institution}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 14, color: 'var(--color-text-muted)' }}>
                  <div>{e.start_year}{e.end_year ? ` — ${e.end_year}` : ''}</div>
                  {e.cgpa && <div>{e.cgpa}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="portfolio-section">
            <h2 className="portfolio-section-title">Certifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 12 }}>
              {certifications.map(c => (
                <div key={c.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 14, background: 'var(--color-surface)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{c.organization}{c.date ? ` • ${c.date}` : ''}</div>
                  {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 4, display: 'block' }}>View Credential</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="portfolio-contact">
          <h2>Get In Touch</h2>
          <div className="portfolio-contact-info">
            {profile.email && <div className="portfolio-contact-item">✉️ {profile.email}</div>}
            {profile.phone && <div className="portfolio-contact-item">📱 {profile.phone}</div>}
            {profile.location && <div className="portfolio-contact-item">📍 {profile.location}</div>}
            {links.map(l => (
              <div key={l.id} className="portfolio-contact-item">
                <a href={l.url} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.9)' }}>{l.label || l.platform}</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
