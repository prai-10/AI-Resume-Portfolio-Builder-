import React, { useState, useEffect, useRef } from 'react';
import { aiApi } from '../services/api';
import ResumePreview from '../components/ResumePreview';

const JOB_ROLES = [
  'Software Developer', 'Web Developer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Analyst', 'Data Scientist', 'AI/ML Engineer',
  'UI/UX Designer', 'Graphic Designer', 'Mobile Developer', 'DevOps Engineer',
  'Cloud Engineer', 'Cybersecurity Analyst', 'AI/ML Intern', 'Software Engineer Intern',
  'Product Manager', 'Business Analyst'
];

function ResumeBuilder() {
  const [form, setForm] = useState({
    targetRole: '', targetIndustry: '', jobDescription: '', template: 'modern'
  });
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiMode, setAiMode] = useState('demo');
  const previewRef = useRef(null);

  useEffect(() => {
    aiApi.status().then(s => setAiMode(s.mode)).catch(() => {});
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!form.targetRole.trim()) { setError('Please select or enter a target job role'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await aiApi.generateResume({
        targetRole: form.targetRole,
        targetIndustry: form.targetIndustry,
        jobDescription: form.jobDescription,
        template: form.template
      });
      setGeneratedDoc(result.document);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Resume Builder</h1>
        <p className="page-subtitle">Generate a tailored resume using your profile data and AI.</p>
      </div>

      {aiMode === 'disabled' && (
        <div className="alert alert-error">
          🤖 <strong>AI Features Disabled</strong> — Resume generation requires <code>AI_API_KEY</code>. Please set it on Vercel to use this feature.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: generatedDoc ? '380px 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Form panel */}
        <div className="card">
          <h2 className="card-title">Generation Settings</h2>
          <form onSubmit={handleGenerate}>
            {error && <div className="alert alert-error">❌ {error}</div>}

            <div className="form-group">
              <label className="form-label">Target Job Role <span className="required">*</span></label>
              <input
                className="form-input" list="roles-list"
                value={form.targetRole}
                onChange={e => setForm({ ...form, targetRole: e.target.value })}
                placeholder="Select or type a role..."
              />
              <datalist id="roles-list">
                {JOB_ROLES.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Target Industry</label>
              <input className="form-input" value={form.targetIndustry} onChange={e => setForm({ ...form, targetIndustry: e.target.value })} placeholder="E.g. FinTech, Healthcare, EdTech" />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: 12 }}>(optional — improves tailoring)</span></label>
              <textarea className="form-textarea" rows={5} value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })} placeholder="Paste the job description here..." />
            </div>

            <div className="form-group">
              <label className="form-label">Template Style</label>
              <div className="template-toggle">
                {['modern', 'ats'].map(t => (
                  <button key={t} type="button" className={`template-btn ${form.template === t ? 'active' : ''}`} onClick={() => setForm({ ...form, template: t })}>
                    {t === 'modern' ? '✨ Modern' : '📋 ATS-Friendly'}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || aiMode === 'disabled'}>
              {loading ? '⏳ Generating…' : '🚀 Generate Resume'}
            </button>
          </form>
        </div>

        {/* Preview panel */}
        {generatedDoc && (
          <ResumePreview document={generatedDoc} defaultTemplate={form.template} />
        )}
      </div>
    </div>
  );
}

export default ResumeBuilder;
