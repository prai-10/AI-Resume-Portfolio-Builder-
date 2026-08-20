/**
 * AI Service — wraps an OpenAI-compatible provider.
 * Requires AI_API_KEY to function.
 */
const fetch = require('node-fetch');

// Read once at startup — env vars are stable for the lifetime of the process.
const AI_API_KEY  = (process.env.AI_API_KEY  || '').trim();

let rawModel = (process.env.AI_MODEL || 'gpt-3.5-turbo').trim();
// Automatically clean model names (e.g. "gemini 1.5 flash" -> "gemini-1.5-flash")
if (rawModel.toLowerCase().includes('gemini')) {
  rawModel = rawModel.toLowerCase().replace(/\s+/g, '-');
}
const AI_MODEL = rawModel;

let cleanBaseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').trim();
if (cleanBaseUrl.endsWith('/')) {
  cleanBaseUrl = cleanBaseUrl.slice(0, -1);
}
const AI_BASE_URL = cleanBaseUrl;

if (!AI_API_KEY) {
  console.warn('⚠️ AI Service: Warning - AI_API_KEY is not set. AI requests will fail.');
} else {
  console.log(`🤖 AI Service: Live AI — model=${AI_MODEL} base=${AI_BASE_URL}`);
}

/**
 * Internal: call the configured AI provider.
 */
async function callAI(systemPrompt, userPrompt) {
  if (!AI_API_KEY) {
    throw new Error('AI API Key is missing. Please configure AI_API_KEY in environment variables.');
  }

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
    throw new Error(`AI provider unreachable (${AI_BASE_URL}): ${networkErr.message}`);
  }

  if (!response.ok) {
    let hint = '';
    try {
      const body = await response.json();
      if (body?.error?.message) hint = `: ${body.error.message}`;
    } catch (_) {}
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

  if (!AI_API_KEY) {
    throw new Error('AI API Key is not configured. Live AI resume generation is unavailable.');
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

  const raw = await callAI(systemPrompt, userPrompt);
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
  return JSON.parse(jsonMatch[1].trim());
}

// ─── Public: generate cover letter ───────────────────────────────────────────

async function generateCoverLetter(profileData, targetCompany, jobTitle, jobDescription) {
  const { profile, education, skills, projects, experience } = profileData;

  if (!AI_API_KEY) {
    throw new Error('AI API Key is not configured. Live AI cover letter generation is unavailable.');
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

  const raw = await callAI(systemPrompt, userPrompt);
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
  return JSON.parse(jsonMatch[1].trim());
}

module.exports = { generateResume, generateCoverLetter, AI_MODEL };
