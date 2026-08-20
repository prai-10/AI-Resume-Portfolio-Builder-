import React, { useState, useEffect, useCallback } from 'react';
import {
  profileApi, educationApi, skillsApi, projectsApi,
  experienceApi, certificationsApi, achievementsApi, linksApi
} from '../services/api';

// ── Reusable components ──────────────────────────────────────

function Alert({ type, msg, onClose }) {
  if (!msg) return null;
  return (
    <div className={`alert alert-${type}`} style={{ position: 'relative' }}>
      {type === 'success' ? '✅' : '❌'} {msg}
      {onClose && <button onClick={onClose} style={{ position: 'absolute', right: 10, top: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit' }}>×</button>}
    </div>
  );
}

function FieldGroup({ label, required, error, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span className="required">*</span>}</label>
      {children}
      {error && <div className="form-error">{error}</div>}
      {hint && !error && <div className="form-hint">{hint}</div>}
    </div>
  );
}

// ── Profile section ──────────────────────────────────────────

function ProfileSection() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', location: '', headline: '', about: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileApi.get().then(data => { setForm({ full_name: data.full_name || '', email: data.email || '', phone: data.phone || '', location: data.location || '', headline: data.headline || '', about: data.about || '' }); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function validate() {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    return e;
  }

  async function handleSave(e) {
    e.preventDefault();
    const e2 = validate(); setErrors(e2);
    if (Object.keys(e2).length) return;
    setSaving(true);
    try {
      await profileApi.update(form);
      setMsg({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally { setSaving(false); }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <form onSubmit={handleSave}>
      <Alert type={msg?.type} msg={msg?.text} onClose={() => setMsg(null)} />
      <div className="form-row">
        <FieldGroup label="Full Name" required error={errors.full_name}>
          <input className={`form-input ${errors.full_name ? 'error' : ''}`} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" />
        </FieldGroup>
        <FieldGroup label="Email" error={errors.email}>
          <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
        </FieldGroup>
      </div>
      <div className="form-row">
        <FieldGroup label="Phone">
          <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
        </FieldGroup>
        <FieldGroup label="Location">
          <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, State, Country" />
        </FieldGroup>
      </div>
      <FieldGroup label="Professional Headline" hint="E.g. Full Stack Developer | React & Node.js">
        <input className="form-input" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="Full Stack Developer" />
      </FieldGroup>
      <FieldGroup label="About / Career Objective">
        <textarea className="form-textarea" value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} placeholder="Write a brief professional summary..." rows={4} />
      </FieldGroup>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : '💾 Save Profile'}</button>
      </div>
    </form>
  );
}

// ── Generic CRUD section ─────────────────────────────────────

function CRUDSection({ title, apiModule, fields, emptyIcon, emptyTitle, emptyDesc, renderItem }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = not editing, {} = new, {id,...} = existing
  const [msg, setMsg] = useState(null);

  const load = useCallback(() => {
    apiModule.getAll().then(setItems).catch(err => setMsg({ type: 'error', text: err.message })).finally(() => setLoading(false));
  }, [apiModule]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(formData) {
    try {
      if (formData.id) {
        await apiModule.update(formData.id, formData);
        setMsg({ type: 'success', text: `${title} updated!` });
      } else {
        await apiModule.create(formData);
        setMsg({ type: 'success', text: `${title} added!` });
      }
      setEditing(null);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return;
    try {
      await apiModule.delete(id);
      setMsg({ type: 'success', text: 'Deleted.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  }

  return (
    <div>
      <Alert type={msg?.type} msg={msg?.text} onClose={() => setMsg(null)} />

      {editing !== null ? (
        <ItemForm fields={fields} initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      ) : (
        <div className="section-header">
          <span></span>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing({})}>+ Add {title}</button>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : items.length === 0 && editing === null ? (
        <div className="empty-state">
          <div className="empty-icon">{emptyIcon}</div>
          <div className="empty-title">{emptyTitle}</div>
          <div className="empty-desc">{emptyDesc}</div>
        </div>
      ) : (
        items.map(item => (
          <div key={item.id} className="list-item">
            <div className="list-item-content">{renderItem(item)}</div>
            <div className="list-item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(item)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ItemForm({ fields, initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...initial });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    fields.forEach(f => {
      if (f.required && !form[f.name]?.toString().trim()) {
        e[f.name] = `${f.label} is required`;
      }
    });
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate(); setErrors(e2);
    if (Object.keys(e2).length) return;
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 16, background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {fields.map(f => (
          <FieldGroup key={f.name} label={f.label} required={f.required} error={errors[f.name]} hint={f.hint}>
            {f.type === 'textarea' ? (
              <textarea className={`form-textarea ${errors[f.name] ? 'error' : ''}`} value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} rows={3} />
            ) : f.type === 'select' ? (
              <select className="form-select" value={form[f.name] || f.options[0]?.value} onChange={e => setForm({ ...form, [f.name]: e.target.value })}>
                {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'checkbox' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <input type="checkbox" checked={!!form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.checked })} />
                {f.checkboxLabel || 'Yes'}
              </label>
            ) : (
              <input type={f.type || 'text'} className={`form-input ${errors[f.name] ? 'error' : ''}`} value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} />
            )}
          </FieldGroup>
        ))}
      </div>
      <div className="form-actions" style={{ marginTop: 12 }}>
        <button type="submit" className="btn btn-primary btn-sm">💾 Save</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ── Skills section (custom UI) ───────────────────────────────

function SkillsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'technical', proficiency: 'intermediate' });
  const [msg, setMsg] = useState(null);

  const load = () => skillsApi.getAll().then(setItems).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Skill name is required' }); return; }
    try {
      await skillsApi.create(form);
      setForm({ name: '', category: form.category, proficiency: 'intermediate' });
      setShowForm(false);
      load();
      setMsg({ type: 'success', text: 'Skill added!' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this skill?')) return;
    await skillsApi.delete(id);
    load();
  }

  const categories = ['technical', 'soft', 'tools'];
  const catLabels = { technical: '💻 Technical', soft: '🤝 Soft Skills', tools: '🔧 Tools & Tech' };
  const catClasses = { technical: 'skill-technical', soft: 'skill-soft', tools: 'skill-tools' };

  return (
    <div>
      <Alert type={msg?.type} msg={msg?.text} onClose={() => setMsg(null)} />
      {showForm ? (
        <form onSubmit={handleAdd} className="card" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', marginBottom: 16 }}>
          <div className="form-row-3">
            <FieldGroup label="Skill Name" required>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="E.g. React, Python" autoFocus />
            </FieldGroup>
            <FieldGroup label="Category">
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="technical">Technical</option>
                <option value="soft">Soft Skill</option>
                <option value="tools">Tools & Tech</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Proficiency">
              <select className="form-select" value={form.proficiency} onChange={e => setForm({ ...form, proficiency: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </FieldGroup>
          </div>
          <div className="form-actions" style={{ marginTop: 8 }}>
            <button type="submit" className="btn btn-primary btn-sm">Add Skill</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add Skill</button>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <div className="empty-title">No skills yet</div>
          <div className="empty-desc">Add your technical skills, soft skills, and tools.</div>
        </div>
      ) : (
        categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          if (!catItems.length) return null;
          return (
            <div key={cat} style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{catLabels[cat]}</h4>
              <div className="skill-tags">
                {catItems.map(skill => (
                  <span key={skill.id} className={`skill-tag ${catClasses[cat]}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {skill.name}
                    <span style={{ fontSize: 10, opacity: 0.7 }}>({skill.proficiency})</span>
                    <button onClick={() => handleDelete(skill.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, opacity: 0.7, marginLeft: 2, lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── FIELD CONFIGS ────────────────────────────────────────────

const EDUCATION_FIELDS = [
  { name: 'degree', label: 'Degree / Course', required: true, placeholder: 'B.Tech Computer Science' },
  { name: 'institution', label: 'Institution', required: true, placeholder: 'University Name' },
  { name: 'start_year', label: 'Start Year', placeholder: '2020' },
  { name: 'end_year', label: 'End Year / Expected', placeholder: '2024' },
  { name: 'cgpa', label: 'CGPA / Percentage', placeholder: '8.5 / 85%' },
  { name: 'description', label: 'Description (optional)', type: 'textarea', placeholder: 'Relevant coursework, honors...' }
];

const EXPERIENCE_FIELDS = [
  { name: 'company', label: 'Company / Organization', required: true, placeholder: 'Google' },
  { name: 'role', label: 'Role / Job Title', required: true, placeholder: 'Software Developer Intern' },
  { name: 'location', label: 'Location', placeholder: 'City, Country or Remote' },
  { name: 'start_date', label: 'Start Date', placeholder: 'Jan 2023' },
  { name: 'end_date', label: 'End Date', placeholder: 'May 2023 (leave blank if current)' },
  { name: 'is_current', label: 'Currently Working Here', type: 'checkbox', checkboxLabel: 'Yes, I currently work here' },
  { name: 'responsibilities', label: 'Responsibilities', type: 'textarea', placeholder: 'Describe your main responsibilities (one per line)...' },
  { name: 'achievements', label: 'Achievements', type: 'textarea', placeholder: 'Key achievements at this role...' }
];

const PROJECT_FIELDS = [
  { name: 'name', label: 'Project Name', required: true, placeholder: 'E-Commerce App' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description of the project...' },
  { name: 'technologies', label: 'Technologies Used', placeholder: 'React, Node.js, MongoDB' },
  { name: 'github_url', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/...' },
  { name: 'project_url', label: 'Live Demo URL', type: 'url', placeholder: 'https://myproject.com' },
  { name: 'contributions', label: 'Key Contributions', type: 'textarea', placeholder: 'Your specific contributions (one per line)...' }
];

const CERT_FIELDS = [
  { name: 'name', label: 'Certification Name', required: true, placeholder: 'AWS Cloud Practitioner' },
  { name: 'organization', label: 'Issuing Organization', required: true, placeholder: 'Amazon Web Services' },
  { name: 'date', label: 'Date', placeholder: 'March 2023' },
  { name: 'credential_id', label: 'Credential ID', placeholder: 'Optional' },
  { name: 'credential_url', label: 'Credential URL', type: 'url', placeholder: 'https://...' }
];

const ACHIEVEMENT_FIELDS = [
  { name: 'title', label: 'Achievement Title', required: true, placeholder: 'Hackathon Winner' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Details about this achievement...' },
  { name: 'date', label: 'Date', placeholder: 'March 2023' }
];

const LINK_FIELDS = [
  {
    name: 'platform', label: 'Platform', required: true, type: 'select',
    options: [
      { value: 'github', label: 'GitHub' }, { value: 'linkedin', label: 'LinkedIn' },
      { value: 'portfolio', label: 'Portfolio Website' }, { value: 'twitter', label: 'Twitter/X' },
      { value: 'other', label: 'Other' }
    ]
  },
  { name: 'url', label: 'URL', required: true, type: 'url', placeholder: 'https://...' },
  { name: 'label', label: 'Display Label (optional)', placeholder: 'My GitHub' }
];

// ── RENDER ITEM HELPERS ──────────────────────────────────────

const renderEducation = item => (
  <>
    <div className="list-item-title">{item.degree}</div>
    <div className="list-item-subtitle">{item.institution}{item.end_year ? ` • ${item.end_year}` : ''}{item.cgpa ? ` • ${item.cgpa}` : ''}</div>
  </>
);

const renderExperience = item => (
  <>
    <div className="list-item-title">{item.role} at {item.company}</div>
    <div className="list-item-subtitle">{item.start_date && `${item.start_date} → `}{item.is_current ? 'Present' : item.end_date || ''}{item.location ? ` • ${item.location}` : ''}</div>
  </>
);

const renderProject = item => (
  <>
    <div className="list-item-title">{item.name}</div>
    <div className="list-item-subtitle">{item.technologies ? `${item.technologies}` : ''}{item.description ? ` — ${item.description.substring(0, 80)}…` : ''}</div>
  </>
);

const renderCert = item => (
  <>
    <div className="list-item-title">{item.name}</div>
    <div className="list-item-subtitle">{item.organization}{item.date ? ` • ${item.date}` : ''}</div>
  </>
);

const renderAchievement = item => (
  <>
    <div className="list-item-title">{item.title}</div>
    <div className="list-item-subtitle">{item.description?.substring(0, 100) || ''}</div>
  </>
);

const renderLink = item => (
  <>
    <div className="list-item-title" style={{ textTransform: 'capitalize' }}>{item.platform}</div>
    <div className="list-item-subtitle"><a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{item.url}</a></div>
  </>
);

// ── Main Profile page ────────────────────────────────────────

const TABS = [
  { key: 'personal', label: '👤 Personal' },
  { key: 'education', label: '🎓 Education' },
  { key: 'skills', label: '💡 Skills' },
  { key: 'experience', label: '💼 Experience' },
  { key: 'projects', label: '🚀 Projects' },
  { key: 'certifications', label: '🏆 Certifications' },
  { key: 'achievements', label: '⭐ Achievements' },
  { key: 'links', label: '🔗 Links' },
];

function Profile() {
  const [tab, setTab] = useState('personal');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile Builder</h1>
        <p className="page-subtitle">Build your complete profile — all information persists in the database and powers AI generation.</p>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'personal' && <><h2 className="card-title">Personal Information</h2><ProfileSection /></>}
        {tab === 'education' && <><h2 className="card-title">Education</h2><CRUDSection title="Education" apiModule={educationApi} fields={EDUCATION_FIELDS} emptyIcon="🎓" emptyTitle="No education added" emptyDesc="Add your degrees and academic qualifications." renderItem={renderEducation} /></>}
        {tab === 'skills' && <><h2 className="card-title">Skills</h2><SkillsSection /></>}
        {tab === 'experience' && <><h2 className="card-title">Work Experience</h2><CRUDSection title="Experience" apiModule={experienceApi} fields={EXPERIENCE_FIELDS} emptyIcon="💼" emptyTitle="No experience added" emptyDesc="Add your work experience, internships, and part-time jobs." renderItem={renderExperience} /></>}
        {tab === 'projects' && <><h2 className="card-title">Projects</h2><CRUDSection title="Project" apiModule={projectsApi} fields={PROJECT_FIELDS} emptyIcon="🚀" emptyTitle="No projects added" emptyDesc="Add your personal and academic projects." renderItem={renderProject} /></>}
        {tab === 'certifications' && <><h2 className="card-title">Certifications</h2><CRUDSection title="Certification" apiModule={certificationsApi} fields={CERT_FIELDS} emptyIcon="🏆" emptyTitle="No certifications added" emptyDesc="Add your certifications and courses." renderItem={renderCert} /></>}
        {tab === 'achievements' && <><h2 className="card-title">Achievements</h2><CRUDSection title="Achievement" apiModule={achievementsApi} fields={ACHIEVEMENT_FIELDS} emptyIcon="⭐" emptyTitle="No achievements added" emptyDesc="Add your awards, honors, and accomplishments." renderItem={renderAchievement} /></>}
        {tab === 'links' && <><h2 className="card-title">Links & Profiles</h2><CRUDSection title="Link" apiModule={linksApi} fields={LINK_FIELDS} emptyIcon="🔗" emptyTitle="No links added" emptyDesc="Add your GitHub, LinkedIn, portfolio and other relevant links." renderItem={renderLink} /></>}
      </div>
    </div>
  );
}

export default Profile;
