import React, { useState, useRef } from 'react';

/**
 * ResumePreview — renders an A4-style resume with two templates and PDF download.
 * Uses jsPDF + html2canvas for real PDF generation.
 */
function ResumePreview({ document: doc, defaultTemplate = 'modern' }) {
  const [template, setTemplate] = useState(defaultTemplate);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef(null);

  const content = doc?.content;
  if (!content) return <div className="alert alert-warning">No resume content to preview.</div>;

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      // Dynamic import to keep bundle small
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Handle multi-page PDFs
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let yPos = 0;
        let remainingHeight = pdfHeight;
        let first = true;
        while (remainingHeight > 0) {
          if (!first) pdf.addPage();
          const sliceH = Math.min(pageHeight, remainingHeight);
          const ratio = canvas.width / pdfWidth;
          const srcY = yPos * ratio;
          const srcH = sliceH * ratio;
          // Crop canvas slice
          const sliceCanvas = window.document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = srcH;
          sliceCanvas.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
          pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, sliceH);
          yPos += pageHeight;
          remainingHeight -= pageHeight;
          first = false;
        }
      }

      const name = doc?.title?.replace(/[^a-z0-9]/gi, '_') || 'resume';
      pdf.save(`${name}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Try using browser Print (Ctrl+P) and Save as PDF instead.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      {/* Controls */}
      <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{doc.title}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {doc.target_role && `${doc.target_role} • `}
              {new Date(doc.created_at).toLocaleDateString()}
              {doc.content?._mode === 'demo' && <span className="badge badge-demo" style={{ marginLeft: 8 }}>Demo Mode</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="template-toggle" style={{ margin: 0 }}>
              {['modern', 'ats'].map(t => (
                <button key={t} className={`template-btn ${template === t ? 'active' : ''}`} onClick={() => setTemplate(t)} style={{ padding: '6px 14px', fontSize: 13 }}>
                  {t === 'modern' ? '✨ Modern' : '📋 ATS'}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleDownloadPDF} disabled={downloading}>
              {downloading ? '⏳ Generating…' : '⬇️ Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* A4 Preview */}
      <div style={{ overflowX: 'auto' }}>
        <div ref={previewRef} className={`a4-paper resume-${template}`} id="resume-preview">
          {template === 'modern' ? (
            <ModernTemplate content={content} />
          ) : (
            <ATSTemplate content={content} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modern Template ────────────────────────────────────────────────────────

function ModernTemplate({ content }) {
  const allLinks = [
    content.links?.github && { label: 'GitHub', url: content.links.github },
    content.links?.linkedin && { label: 'LinkedIn', url: content.links.linkedin },
    content.links?.portfolio && { label: 'Portfolio', url: content.links.portfolio },
  ].filter(Boolean);

  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: '3px solid #4f46e5', paddingBottom: 14, marginBottom: 4 }}>
        <div className="resume-name">{content.name || 'Your Name'}</div>
        {content.headline && <div className="resume-headline">{content.headline}</div>}
        <div className="resume-contact">
          {content.email && <span>✉ {content.email}</span>}
          {content.phone && <span>📱 {content.phone}</span>}
          {content.location && <span>📍 {content.location}</span>}
          {allLinks.map(l => <span key={l.label}><a href={l.url} style={{ color: '#4f46e5' }}>{l.label}</a></span>)}
        </div>
      </div>

      {/* Summary */}
      {content.summary && (
        <div>
          <div className="resume-section-title">Professional Summary</div>
          <p style={{ fontSize: 12.5 }}>{content.summary}</p>
        </div>
      )}

      {/* Objective */}
      {content.objective && !content.summary && (
        <div>
          <div className="resume-section-title">Objective</div>
          <p style={{ fontSize: 12.5 }}>{content.objective}</p>
        </div>
      )}

      {/* Skills */}
      {content.skills && (
        (content.skills.technical?.length > 0 || content.skills.soft?.length > 0 || content.skills.tools?.length > 0) && (
          <div>
            <div className="resume-section-title">Skills</div>
            {content.skills.technical?.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <strong style={{ fontSize: 12 }}>Technical: </strong>
                <span style={{ fontSize: 12 }}>{content.skills.technical.join(' • ')}</span>
              </div>
            )}
            {content.skills.tools?.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <strong style={{ fontSize: 12 }}>Tools & Tech: </strong>
                <span style={{ fontSize: 12 }}>{content.skills.tools.join(' • ')}</span>
              </div>
            )}
            {content.skills.soft?.length > 0 && (
              <div>
                <strong style={{ fontSize: 12 }}>Soft Skills: </strong>
                <span style={{ fontSize: 12 }}>{content.skills.soft.join(' • ')}</span>
              </div>
            )}
          </div>
        )
      )}

      {/* Education */}
      {content.education?.length > 0 && (
        <div>
          <div className="resume-section-title">Education</div>
          {content.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="resume-item-title">{e.degree}</span>
                <span className="resume-item-date">{e.year}</span>
              </div>
              <div className="resume-item-subtitle">{e.institution}{e.cgpa ? ` • ${e.cgpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {content.experience?.length > 0 && (
        <div>
          <div className="resume-section-title">Experience</div>
          {content.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="resume-item-title">{e.role}</span>
                <span className="resume-item-date">{e.duration}</span>
              </div>
              <div className="resume-item-subtitle">{e.company}{e.location ? ` — ${e.location}` : ''}</div>
              {e.highlights?.map((h, j) => <div key={j} className="resume-bullet">{h}</div>)}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {content.projects?.length > 0 && (
        <div>
          <div className="resume-section-title">Projects</div>
          {content.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="resume-item-title">{p.name}</span>
                {p.technologies && <span className="resume-item-date">{p.technologies}</span>}
              </div>
              {p.description && <div className="resume-item-subtitle">{p.description}</div>}
              {p.highlights?.map((h, j) => <div key={j} className="resume-bullet">{h}</div>)}
              <div style={{ marginTop: 3 }}>
                {p.github_url && <a href={p.github_url} style={{ fontSize: 11, color: '#4f46e5', marginRight: 12 }}>GitHub</a>}
                {p.project_url && <a href={p.project_url} style={{ fontSize: 11, color: '#4f46e5' }}>Live Demo</a>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {content.certifications?.length > 0 && (
        <div>
          <div className="resume-section-title">Certifications</div>
          {content.certifications.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span className="resume-item-title">{c.name} — <span style={{ fontWeight: 400 }}>{c.organization}</span></span>
              <span className="resume-item-date">{c.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {content.achievements?.length > 0 && (
        <div>
          <div className="resume-section-title">Achievements</div>
          {content.achievements.map((a, i) => (
            <div key={i} className="resume-bullet">{a.title}{a.description ? ` — ${a.description}` : ''}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ATS Template ───────────────────────────────────────────────────────────

function ATSTemplate({ content }) {
  const allLinks = [
    content.links?.github && `GitHub: ${content.links.github}`,
    content.links?.linkedin && `LinkedIn: ${content.links.linkedin}`,
    content.links?.portfolio && `Portfolio: ${content.links.portfolio}`,
  ].filter(Boolean);

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 12, borderBottom: '2px solid #000', paddingBottom: 10 }}>
        <div className="resume-name">{content.name || 'Your Name'}</div>
        {content.headline && <div className="resume-headline">{content.headline}</div>}
        <div className="resume-contact" style={{ justifyContent: 'center' }}>
          {content.email && <span>{content.email}</span>}
          {content.phone && <span> | {content.phone}</span>}
          {content.location && <span> | {content.location}</span>}
          {allLinks.map((l, i) => <span key={i}> | {l}</span>)}
        </div>
      </div>

      {/* Objective/Summary */}
      {(content.objective || content.summary) && (
        <div>
          <div className="resume-section-title">OBJECTIVE</div>
          <p style={{ fontSize: 12.5 }}>{content.objective || content.summary}</p>
        </div>
      )}

      {/* Skills */}
      {content.skills && (
        (content.skills.technical?.length > 0 || content.skills.soft?.length > 0 || content.skills.tools?.length > 0) && (
          <div>
            <div className="resume-section-title">TECHNICAL SKILLS</div>
            {content.skills.technical?.length > 0 && <p style={{ fontSize: 12 }}><strong>Languages/Frameworks: </strong>{content.skills.technical.join(', ')}</p>}
            {content.skills.tools?.length > 0 && <p style={{ fontSize: 12, marginTop: 3 }}><strong>Tools: </strong>{content.skills.tools.join(', ')}</p>}
            {content.skills.soft?.length > 0 && <p style={{ fontSize: 12, marginTop: 3 }}><strong>Soft Skills: </strong>{content.skills.soft.join(', ')}</p>}
          </div>
        )
      )}

      {/* Education */}
      {content.education?.length > 0 && (
        <div>
          <div className="resume-section-title">EDUCATION</div>
          {content.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 12.5 }}>{e.degree}</strong>
                <span className="resume-item-date">{e.year}</span>
              </div>
              <div style={{ fontSize: 12 }}>{e.institution}{e.cgpa ? ` | GPA: ${e.cgpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {content.experience?.length > 0 && (
        <div>
          <div className="resume-section-title">WORK EXPERIENCE</div>
          {content.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 12.5 }}>{e.role}</strong>
                <span className="resume-item-date">{e.duration}</span>
              </div>
              <div style={{ fontSize: 12 }}>{e.company}</div>
              {e.highlights?.map((h, j) => <div key={j} className="resume-bullet">{h}</div>)}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {content.projects?.length > 0 && (
        <div>
          <div className="resume-section-title">PROJECTS</div>
          {content.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong style={{ fontSize: 12.5 }}>{p.name}</strong>
              {p.technologies && <span style={{ fontSize: 12 }}> | {p.technologies}</span>}
              {p.description && <div className="resume-bullet">{p.description}</div>}
              {p.highlights?.map((h, j) => <div key={j} className="resume-bullet">{h}</div>)}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {content.certifications?.length > 0 && (
        <div>
          <div className="resume-section-title">CERTIFICATIONS</div>
          {content.certifications.map((c, i) => (
            <div key={i} style={{ fontSize: 12.5, marginBottom: 4 }}>
              {c.name} | {c.organization}{c.date ? ` | ${c.date}` : ''}
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {content.achievements?.length > 0 && (
        <div>
          <div className="resume-section-title">ACHIEVEMENTS</div>
          {content.achievements.map((a, i) => (
            <div key={i} className="resume-bullet">{a.title}{a.description ? ': ' + a.description : ''}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumePreview;
