import React, { useState, useEffect } from 'react';
import { aiApi, documentsApi } from '../services/api';
import ResumePreview from '../components/ResumePreview';

const JOB_ROLES = [
  'Software Developer', 'Web Developer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Analyst', 'Data Scientist', 'AI/ML Engineer',
  'UI/UX Designer', 'Mobile Developer', 'DevOps Engineer', 'Cloud Engineer',
  'Cybersecurity Analyst', 'AI/ML Intern', 'Software Engineer Intern',
  'Product Manager', 'Business Analyst', 'Graphic Designer'
];

function AIGenerator() {
  const [aiStatus, setAiStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generation form state
  const [form, setForm] = useState({ targetRole: '', targetIndustry: '', jobDescription: '', template: 'modern' });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const loadDocs = () =>
    documentsApi.getAll().then(docs => setDocuments(docs.filter(d => d.type === 'resume')));

  useEffect(() => {
    Promise.all([aiApi.status(), documentsApi.getAll()])
      .then(([status, docs]) => {
        setAiStatus(status);
        setDocuments(docs.filter(d => d.type === 'resume'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!form.targetRole.trim()) { setGenError('Please select or enter a target job role'); return; }
    setGenError('');
    setGenerating(true);
    try {
      const result = await aiApi.generateResume({
        targetRole: form.targetRole,
        targetIndustry: form.targetIndustry,
        jobDescription: form.jobDescription,
        template: form.template
      });
      await loadDocs();
      setSelectedDoc(result.document);
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div><span className="loading-text">Loading...</span></div>;

  const isDemo = aiStatus?.mode !== 'live';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Generator</h1>
        <p className="page-subtitle">Generate tailored resumes powered by AI or Demo Mode.</p>
      </div>

      {/* Status bar — compact, non-blocking */}
      <div className="alert" style={{
        background: isDemo ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
        color: isDemo ? 'var(--color-warning)' : 'var(--color-success)',
        border: `1px solid ${isDemo ? 'var(--color-warning)' : 'var(--color-success)'}`,
        marginBottom: 20
      }}>
        {isDemo ? '🟡' : '🟢'}
        <span>
          <strong>{isDemo ? 'Demo Mode' : 'Live AI'}</strong>
          {isDemo
            ? ' — AI API key not configured. Generating resume from your stored profile data.'
            : ` — Using model: ${aiStatus?.model}`}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDoc ? '360px 1fr' : '420px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left column: form + saved list */}
        <div>
          {/* Generation form */}
          <div className="card">
            <h2 className="card-title">Generate Resume</h2>
            <form onSubmit={handleGenerate}>
              {genError && <div className="alert alert-error">❌ {genError}</div>}

              <div className="form-group">
                <label className="form-label">Target Job Role <span className="required">*</span></label>
                <input
                  className="form-input"
                  list="ai-roles-list"
                  value={form.targetRole}
                  onChange={e => setForm({ ...form, targetRole: e.target.value })}
                  placeholder="Select or type a role..."
                />
                <datalist id="ai-roles-list">
                  {JOB_ROLES.map(r => <option key={r} value={r} />)}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Target Industry</label>
                <input
                  className="form-input"
                  value={form.targetIndustry}
                  onChange={e => setForm({ ...form, targetIndustry: e.target.value })}
                  placeholder="e.g. FinTech, EdTech, Healthcare"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Job Description
                  <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 6 }}>(optional)</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={form.jobDescription}
                  onChange={e => setForm({ ...form, jobDescription: e.target.value })}
                  placeholder="Paste the job description to improve tailoring..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Template</label>
                <div className="template-toggle">
                  {['modern', 'ats'].map(t => (
                    <button
                      key={t} type="button"
                      className={`template-btn ${form.template === t ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, template: t })}
                    >
                      {t === 'modern' ? '✨ Modern' : '📋 ATS-Friendly'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={generating}
              >
                {generating
                  ? '⏳ Generating…'
                  : isDemo
                    ? '🤖 Generate Resume (Demo Mode)'
                    : '🤖 Generate Resume (Live AI)'}
              </button>
            </form>
          </div>

          {/* Saved resumes list */}
          <div className="card">
            <div className="section-header">
              <h2 className="card-title" style={{ margin: 0 }}>Generated Resumes</h2>
              <span className="badge badge-primary">{documents.length}</span>
            </div>

            {documents.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-icon">🤖</div>
                <div className="empty-title">No resumes yet</div>
                <div className="empty-desc">Generate your first resume above.</div>
              </div>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  className="list-item"
                  style={{ cursor: 'pointer', background: selectedDoc?.id === doc.id ? 'var(--color-primary-light)' : undefined }}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="list-item-content">
                    <div className="list-item-title">{doc.title}</div>
                    <div className="list-item-subtitle">
                      <span className="badge badge-primary" style={{ marginRight: 6 }}>{doc.template || 'modern'}</span>
                      {new Date(doc.created_at).toLocaleDateString()}
                      {doc.metadata?.mode === 'demo' && (
                        <span className="badge badge-demo" style={{ marginLeft: 6 }}>Demo</span>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm">View</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: preview */}
        {selectedDoc ? (
          <ResumePreview document={selectedDoc} defaultTemplate={selectedDoc.template || 'modern'} />
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <div className="empty-title">Resume preview will appear here</div>
              <div className="empty-desc">Generate a resume or click a saved one to preview it.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIGenerator;
