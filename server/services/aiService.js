/**
 * AI Service — wraps an OpenAI-compatible provider.
 * Falls back to Demo Mode automatically when AI_API_KEY is absent.
 *
 * Environment variables (set in server/.env):
 *   AI_API_KEY   — provider API key (required for Live AI; omit for Demo Mode)
 *   AI_MODEL     — model name, default gpt-3.5-turbo
 *   AI_BASE_URL  — API base URL, default https://api.openai.com/v1
 *                  Override for compatible providers (Gemini, Groq, Azure, etc.)
 */
const fetch = require('node-fetch');

// Read once at startup — env vars are stable for the lifetime of the process.
const AI_API_KEY  = (process.env.AI_API_KEY  || '').trim();
const AI_MODEL    = (process.env.AI_MODEL    || 'gpt-3.5-turbo').trim();
const AI_BASE_URL = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').trim();

const isDemoMode = !AI_API_KEY;

// Log mode once on require — never log the key itself.
if (isDemoMode) {
  console.log('🤖 AI Service: Demo Mode (AI_API_KEY not set)');
} else {
  console.log(`🤖 AI Service: Live AI — model=${AI_MODEL} base=${AI_BASE_URL}`);
}

/**
 * Internal: call the configured AI provider.
 * Throws a sanitized error — never exposes the raw API key or full response body.
 */
async function callAI(systemPrompt, userPrompt) {
  if (isDemoMode) return null;

  let response;
  try {
    response = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt   }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
  } catch (networkErr) {
    // Network failure — safe to surface provider URL but not key
    throw new Error(`AI provider unreachable (${AI_BASE_URL}): ${networkErr.message}`);
  }

  if (!response.ok) {
    // Sanitize: only expose the HTTP status code, not the full body (may contain key echoes)
    let hint = '';
    try {
      const body = await response.json();
      // Only surface the provider's message field if it exists — never the raw body
      if (body?.error?.message) hint = `: ${body.error.message}`;
    } catch (_) { /* ignore parse errors */ }
    throw new Error(`AI provider returned HTTP ${response.status}${hint}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI provider returned an empty response');
  return content;
}

// ─── Public: generate resume ─────────────────────────────────────────────────

async function generateResume(profileData, targetRole, targetIndustry, jobDescription) {
  const { profile, education, skills, projects, experience, certifications, achievements, links } = profileData;

  if (isDemoMode) {
    return generateDemoResume(profileData, targetRole, targetIndustry);
  }

  const systemPrompt = `You are an expert resume writer. Generate a professional, ATS-friendly resume.
IMPORTANT RULES:
- NEVER invent or add qualifications, companies, projects, skills, or achievements not provided by the student.
- You may ONLY rephrase, improve clarity, and organize existing information.
- Return ONLY valid JSON matching the exact schema provided.
- Be professional and concise.`;

  const userPrompt = `Create a tailored resume for a ${targetRole} position${targetIndustry ? ` in ${targetIndustry}` : ''}.

STUDENT DATA:
Profile: ${JSON.stringify(profile)}
Education: ${JSON.stringify(education)}
Skills: ${JSON.stringify(skills)}
Projects: ${JSON.stringify(projects)}
Experience: ${JSON.stringify(experience)}
Certifications: ${JSON.stringify(certifications)}
Achievements: ${JSON.stringify(achievements)}
Links: ${JSON.stringify(links)}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}

Return JSON with this exact structure:
{
  "name": "${profile.full_name || ''}",
  "email": "${profile.email || ''}",
  "phone": "${profile.phone || ''}",
  "location": "${profile.location || ''}",
  "headline": "${profile.headline || targetRole}",
  "summary": "2-3 sentence professional summary",
  "objective": "1-2 sentence tailored objective for this role",
  "skills": { "technical": ["skill1","skill2"], "soft": ["skill1"], "tools": ["tool1"] },
  "experience": [{ "company": "", "role": "", "duration": "", "location": "", "highlights": ["bullet1","bullet2"] }],
  "projects": [{ "name": "", "description": "improved description", "technologies": "", "github_url": "", "project_url": "", "highlights": ["bullet1"] }],
  "education": [{ "degree": "", "institution": "", "year": "", "cgpa": "" }],
  "certifications": [{ "name": "", "organization": "", "date": "" }],
  "achievements": [{ "title": "", "description": "" }],
  "links": { "github": "", "linkedin": "", "portfolio": "" }
}`;

  try {
    const raw = await callAI(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    return JSON.parse(jsonMatch[1].trim());
  } catch (err) {
    console.error('AI resume generation failed, falling back to Demo Mode:', err.message);
    return generateDemoResume(profileData, targetRole, targetIndustry);
  }
}

// ─── Public: generate cover letter ───────────────────────────────────────────

async function generateCoverLetter(profileData, targetCompany, jobTitle, jobDescription) {
  const { profile, education, skills, projects, experience } = profileData;

  if (isDemoMode) {
    return generateDemoCoverLetter(profileData, targetCompany, jobTitle, jobDescription);
  }

  const systemPrompt = `You are an expert cover letter writer. Write professional, personalized cover letters.
RULES: Only use information provided. Never invent qualifications or experiences. Be specific and compelling.`;

  const userPrompt = `Write a cover letter for ${profile.full_name || 'the applicant'} applying for ${jobTitle} at ${targetCompany}.

STUDENT DATA:
Profile: ${JSON.stringify(profile)}
Education: ${JSON.stringify(education)}
Top Skills: ${JSON.stringify(skills.slice(0, 10))}
Experience: ${JSON.stringify(experience)}
Projects: ${JSON.stringify(projects.slice(0, 3))}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : ''}

Return JSON:
{
  "subject": "Application for [Job Title] at [Company]",
  "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "salutation": "Dear Hiring Manager,",
  "opening": "opening paragraph",
  "body": ["paragraph 1", "paragraph 2"],
  "closing": "closing paragraph",
  "signature": "Sincerely,\n${profile.full_name || '[Name]'}"
}`;

  try {
    const raw = await callAI(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    return JSON.parse(jsonMatch[1].trim());
  } catch (err) {
    console.error('AI cover letter generation failed, falling back to Demo Mode:', err.message);
    return generateDemoCoverLetter(profileData, targetCompany, jobTitle, jobDescription);
  }
}

// ─── Demo Mode generators ─────────────────────────────────────────────────────

function generateDemoResume(profileData, targetRole, targetIndustry) {
  const { profile, education, skills, projects, experience, certifications, achievements, links } = profileData;

  const techSkills = skills.filter(s => s.category === 'technical').map(s => s.name);
  const softSkills = skills.filter(s => s.category === 'soft').map(s => s.name);
  const toolSkills = skills.filter(s => s.category === 'tools').map(s => s.name);

  const summary = profile.about
    ? profile.about
    : `Motivated ${targetRole || 'professional'} with a strong foundation in ${techSkills.slice(0, 3).join(', ') || 'technology'}.${targetIndustry ? ` Passionate about opportunities in the ${targetIndustry} industry.` : ''} Committed to delivering high-quality results and continuous learning.`;

  const objective = `Seeking a challenging ${targetRole || 'position'} role${targetIndustry ? ` in the ${targetIndustry} sector` : ''} to leverage my skills in ${techSkills.slice(0, 2).join(' and ') || 'software development'} and contribute to organizational growth.`;

  const mappedExperience = experience.map(e => ({
    company: e.company,
    role: e.role,
    duration: `${e.start_date || ''}${e.end_date ? ` - ${e.end_date}` : e.is_current ? ' - Present' : ''}`,
    location: e.location || '',
    highlights: e.responsibilities
      ? e.responsibilities.split('\n').filter(Boolean).slice(0, 4)
      : [`Contributed to ${e.role} responsibilities at ${e.company}`]
  }));

  const mappedProjects = projects.map(p => ({
    name: p.name,
    description: p.description || '',
    technologies: p.technologies || '',
    github_url: p.github_url || '',
    project_url: p.project_url || '',
    highlights: p.contributions
      ? p.contributions.split('\n').filter(Boolean).slice(0, 3)
      : p.description ? [p.description] : []
  }));

  const mappedEducation = education.map(e => ({
    degree: e.degree,
    institution: e.institution,
    year: `${e.start_year || ''}${e.end_year ? ` - ${e.end_year}` : ''}`,
    cgpa: e.cgpa || ''
  }));

  const githubLink   = links.find(l => l.platform?.toLowerCase() === 'github');
  const linkedinLink = links.find(l => l.platform?.toLowerCase() === 'linkedin');
  const portfolioLink= links.find(l => l.platform?.toLowerCase() === 'portfolio');

  return {
    name: profile.full_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    headline: profile.headline || targetRole || '',
    summary,
    objective,
    skills: { technical: techSkills, soft: softSkills, tools: toolSkills },
    experience: mappedExperience,
    projects: mappedProjects,
    education: mappedEducation,
    certifications: certifications.map(c => ({ name: c.name, organization: c.organization, date: c.date || '', credential_url: c.credential_url || '' })),
    achievements: achievements.map(a => ({ title: a.title, description: a.description || '' })),
    links: {
      github:    githubLink?.url    || '',
      linkedin:  linkedinLink?.url  || '',
      portfolio: portfolioLink?.url || ''
    },
    _mode: 'demo'
  };
}

function generateDemoCoverLetter(profileData, targetCompany, jobTitle, jobDescription) {
  const { profile, education, skills, experience, projects } = profileData;
  const name      = profile.full_name || 'Student';
  const techSkills= skills.filter(s => s.category === 'technical').map(s => s.name).slice(0, 4);
  const latestEdu = education[0];
  const latestExp = experience[0];

  const opening = `I am writing to express my strong interest in the ${jobTitle} position at ${targetCompany}. ${profile.about ? profile.about.split('.')[0] + '.' : `As a motivated student with a passion for technology and innovation, I am excited about the opportunity to contribute to your team.`}`;

  const bodyParagraph1 = latestEdu
    ? `I am currently pursuing ${latestEdu.degree} from ${latestEdu.institution}${latestEdu.cgpa ? `, maintaining a CGPA of ${latestEdu.cgpa}` : ''}. My academic background has provided me with a strong foundation in ${techSkills.slice(0, 2).join(' and ') || 'relevant technical areas'}.`
    : `My educational background and self-driven learning have equipped me with the skills necessary to excel in this role.`;

  const bodyParagraph2 = latestExp
    ? `During my time at ${latestExp.company} as ${latestExp.role}, I gained valuable hands-on experience. ${latestExp.responsibilities ? latestExp.responsibilities.split('.')[0] + '.' : ''} This experience has prepared me well for the challenges of the ${jobTitle} role.`
    : projects.length > 0
      ? `Through my project work, particularly ${projects[0].name}${projects[0].description ? ` — ${projects[0].description.split('.')[0]}` : ''}, I have demonstrated my ability to apply technical concepts to real-world problems.`
      : `I am a quick learner who is eager to apply my skills in a professional environment and contribute to ${targetCompany}'s mission.`;

  const closing = `I am enthusiastic about the opportunity to bring my skills in ${techSkills.join(', ') || 'technology'} to ${targetCompany}. I would welcome the chance to discuss how my background aligns with your team's needs. Thank you for considering my application.`;

  return {
    subject:   `Application for ${jobTitle} at ${targetCompany}`,
    date:      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    salutation:'Dear Hiring Manager,',
    opening,
    body:      [bodyParagraph1, bodyParagraph2],
    closing,
    signature: `Sincerely,\n${name}`,
    contact:   { email: profile.email || '', phone: profile.phone || '' },
    _mode:     'demo'
  };
}

module.exports = { generateResume, generateCoverLetter, isDemoMode };
