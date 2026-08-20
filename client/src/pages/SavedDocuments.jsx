import React, { useState, useEffect } from 'react';
import { documentsApi } from '../services/api';
import ResumePreview from '../components/ResumePreview';

function SavedDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    documentsApi.getAll()
      .then(setDocuments)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this document permanently?')) return;
    try {
      await documentsApi.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function renderCoverLetterView(doc) {
    const c = doc.content;
    if (!c) return <p>No content.</p>;
    return (
      <div style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7, fontSize: 13.5 }}>
        <div style={{ marginBottom: 16 }}><strong>{c.date}</strong></div>
        <div style={{ marginBottom: 12 }}>{c.salutation}</div>
        <div style={{ marginBottom: 12 }}>{c.opening}</div>
        {Array.isArray(c.body) && c.body.map((p, i) => <div key={i} style={{ marginBottom: 12 }}>{p}</div>)}
        <div style={{ marginBottom: 16 }}>{c.closing}</div>
        <div style={{ whiteSpace: 'pre-line' }}>{c.signature}</div>
      </div>
    );
  }

  if (loading) return <div className="loading"><div className="spinner"></div><span className="loading-text">Loading documents...</span></div>;

  const resumes = documents.filter(d => d.type === 'resume');
  const coverLetters = documents.filter(d => d.type === 'cover_letter');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Saved Documents</h1>
        <p className="page-subtitle">All your generated resumes and cover letters, stored in the database.</p>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}

      <div className={`page-layout-grid ${selectedDoc ? '' : 'single-column'}`}>
        {/* List panel */}
        <div>
          {/* Resumes */}
          <div className="card">
            <div className="section-header">
              <h2 className="card-title" style={{ margin: 0 }}>📄 Resumes</h2>
              <span className="badge badge-primary">{resumes.length}</span>
            </div>
            {resumes.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}>
                <div className="empty-icon">📄</div>
                <div className="empty-title">No saved resumes</div>
                <div className="empty-desc">Generate a resume from the Resume Builder.</div>
              </div>
            ) : resumes.map(doc => (
              <div key={doc.id} className="list-item"
                style={{ cursor: 'pointer', background: selectedDoc?.id === doc.id ? 'var(--color-primary-light)' : undefined }}
                onClick={() => setSelectedDoc(doc)}>
                <div className="list-item-content">
                  <div className="list-item-title">{doc.title}</div>
                  <div className="list-item-subtitle">
                    <span className="badge badge-primary" style={{ marginRight: 6 }}>{doc.template || 'modern'}</span>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}>🗑️</button>
              </div>
            ))}
          </div>

          {/* Cover Letters */}
          <div className="card">
            <div className="section-header">
              <h2 className="card-title" style={{ margin: 0 }}>✉️ Cover Letters</h2>
              <span className="badge badge-primary">{coverLetters.length}</span>
            </div>
            {coverLetters.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}>
                <div className="empty-icon">✉️</div>
                <div className="empty-title">No cover letters</div>
                <div className="empty-desc">Generate one from the Cover Letter page.</div>
              </div>
            ) : coverLetters.map(doc => (
              <div key={doc.id} className="list-item"
                style={{ cursor: 'pointer', background: selectedDoc?.id === doc.id ? 'var(--color-primary-light)' : undefined }}
                onClick={() => setSelectedDoc(doc)}>
                <div className="list-item-content">
                  <div className="list-item-title">{doc.title}</div>
                  <div className="list-item-subtitle">
                    {doc.target_company && `${doc.target_company} • `}
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview panel */}
        {selectedDoc && (
          selectedDoc.type === 'resume' ? (
            <ResumePreview document={selectedDoc} defaultTemplate={selectedDoc.template || 'modern'} />
          ) : (
            <div className="card">
              <div className="section-header">
                <h2 className="card-title" style={{ margin: 0 }}>{selectedDoc.title}</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>🖨️ Print</button>
              </div>
              <div className="a4-paper" style={{ maxWidth: '100%', boxShadow: 'none', border: '1px solid var(--color-border)', padding: '32px 36px' }}>
                <div style={{ marginBottom: 24, borderBottom: '2px solid #2563eb', paddingBottom: 12 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{selectedDoc.content?.subject}</h2>
                </div>
                {renderCoverLetterView(selectedDoc)}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default SavedDocuments;
