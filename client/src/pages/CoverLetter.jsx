import React, { useState, useEffect } from 'react';
import { aiApi, documentsApi } from '../services/api';

function CoverLetter() {
  const [form, setForm] = useState({ targetCompany: '', jobTitle: '', jobDescription: '' });
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiMode, setAiMode] = useState('demo');

  useEffect(() => {
    Promise.all([
      documentsApi.getAll(),
      aiApi.status()
    ]).then(([docs, status]) => {
      setDocuments(docs.filter(d => d.type === 'cover_letter'));
      setAiMode(status.mode);
    }).catch(console.error).finally(() => setListLoading(false));
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!form.targetCompany.trim() || !form.jobTitle.trim()) {
      setError('Company name and job title are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await aiApi.generateCoverLetter(form);
      setDocuments(prev => [result.document, ...prev]);
      setSelectedDoc(result.document);
      setForm({ targetCompany: '', jobTitle: '', jobDescription: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function renderCoverLetter(doc) {
    if (!doc?.content) return <p>No content available.</p>;
    const c = doc.content;
    return (
      <div style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7, fontSize: 13.5 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700 }}>{c.date}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div>{c.salutation}</div>
        </div>
        <div style={{ marginBottom: 12 }}>{c.opening}</div>
        {Array.isArray(c.body) && c.body.map((p, i) => (
          <div key={i} style={{ marginBottom: 12 }}>{p}</div>
        ))}
        <div style={{ marginBottom: 16 }}>{c.closing}</div>
        <div style={{ whiteSpace: 'pre-line' }}>{c.signature}</div>
        {c.contact && (c.contact.email || c.contact.phone) && (
          <div style={{ marginTop: 8, fontSize: 12.5, color: '#555' }}>
            {c.contact.email && <div>{c.contact.email}</div>}
            {c.contact.phone && <div>{c.contact.phone}</div>}
          </div>
        )}
      </div>
    );
  }

  async function handleDelete(id) {
    if (!confirm('Delete this cover letter?')) return;
    await documentsApi.delete(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cover Letter Generator</h1>
        <p className="page-subtitle">Generate a personalized cover letter for any job application.</p>
      </div>

      {aiMode === 'demo' && (
        <div className="alert alert-info">
          🤖 <strong>Demo Mode</strong> — Cover letters are generated from your stored profile. Set <code>AI_API_KEY</code> for AI-powered generation.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Generator form */}
        <div>
          <div className="card">
            <h2 className="card-title">New Cover Letter</h2>
            <form onSubmit={handleGenerate}>
              {error && <div className="alert alert-error">❌ {error}</div>}
              <div className="form-group">
                <label className="form-label">Target Company <span className="required">*</span></label>
                <input className="form-input" value={form.targetCompany} onChange={e => setForm({ ...form, targetCompany: e.target.value })} placeholder="Google, Microsoft..." />
              </div>
              <div className="form-group">
                <label className="form-label">Job Title <span className="required">*</span></label>
                <input className="form-input" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} placeholder="Software Developer" />
              </div>
              <div className="form-group">
                <label className="form-label">Job Description <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: 12 }}>(optional)</span></label>
                <textarea className="form-textarea" rows={4} value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })} placeholder="Paste job description..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? '⏳ Generating…' : '✉️ Generate Cover Letter'}
              </button>
            </form>
          </div>

          {/* Saved list */}
          <div className="card">
            <h2 className="card-title">Saved Cover Letters</h2>
            {listLoading ? <div className="loading"><div className="spinner"></div></div> :
              documents.length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}>
                  <div className="empty-icon">✉️</div>
                  <div className="empty-title">No cover letters yet</div>
                  <div className="empty-desc">Generate your first cover letter above.</div>
                </div>
              ) : documents.map(doc => (
                <div key={doc.id} className="list-item" style={{ cursor: 'pointer', background: selectedDoc?.id === doc.id ? 'var(--color-primary-light)' : undefined }}
                  onClick={() => setSelectedDoc(doc)}>
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ fontSize: 14 }}>{doc.title}</div>
                    <div className="list-item-subtitle">{new Date(doc.created_at).toLocaleDateString()}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}>🗑️</button>
                </div>
              ))
            }
          </div>
        </div>

        {/* Preview */}
        {selectedDoc ? (
          <div className="card">
            <div className="section-header">
              <h2 className="card-title" style={{ margin: 0 }}>{selectedDoc.title}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={handlePrint}>🖨️ Print/Save PDF</button>
              </div>
            </div>
            <div className="a4-paper" style={{ maxWidth: '100%', boxShadow: 'none', border: '1px solid var(--color-border)', padding: '32px 36px' }}>
              <div style={{ marginBottom: 24, borderBottom: '2px solid #2563eb', paddingBottom: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{selectedDoc.content?.subject}</h2>
              </div>
              {renderCoverLetter(selectedDoc)}
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div className="empty-state">
              <div className="empty-icon">✉️</div>
              <div className="empty-title">Select or generate a cover letter</div>
              <div className="empty-desc">Your cover letter preview will appear here.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoverLetter;
