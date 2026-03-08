const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });



/**
 * Check ATS score for a resume against a job description
 */
const checkAtsScore = async (resumeText, jobDescription) => {
    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the job description.

JOB DESCRIPTION:
<JOB_DESCRIPTION_START>
${jobDescription}
</JOB_DESCRIPTION_END>

RESUME:
<RESUME_TEXT_START>
${resumeText}
</RESUME_TEXT_START>

Provide a detailed ATS analysis in the following JSON format ONLY (no extra text):
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "summary": "<2-3 sentence overall assessment>",
  "keywordMatches": [<list of matched keywords>],
  "missingKeywords": [<list of important missing keywords>],
  "strengths": [<list of 3-5 strengths>],
  "improvements": [<list of 3-5 specific improvements>],
  "sectionScores": {
    "contact": <0-100>,
    "summary": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "skills": <0-100>
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) return {};
    const jsonStr = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonStr);
};

/**
 * Enhance a resume section with AI
 */
const enhanceResume = async (resumeData, targetRole = '') => {
    const prompt = `
You are a professional resume writer and career coach. Enhance the following resume to be ATS-friendly, professional, and impactful.
${targetRole ? `Target Role: ${targetRole}` : ''}

Resume Data (JSON):
<RESUME_DATA>
${JSON.stringify(resumeData, null, 2)}
</RESUME_DATA>

Return an enhanced version of the resume data as JSON with the SAME structure but with:
1. Stronger action verbs in experience descriptions
2. Quantified achievements where possible
3. ATS-optimized keywords for the industry
4. Polished professional summary
5. Skills organized by relevance

Return ONLY the enhanced JSON, same schema as input.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) return {};
    const jsonStr = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonStr);
};

/**
 * Generate a professional summary from resume data
 */
const generateSummary = async (resumeData) => {
    const prompt = `
Write a compelling 3-4 sentence professional summary for this person's resume. Be specific, use strong language, and make it ATS-friendly.

Profile Data:
<USER_PROFILE>
- Name: ${resumeData.personalInfo?.fullName}
- Current Status: ${resumeData.currentStatus || 'Professional'}
- Skills: ${resumeData.skills?.map(s => s.items?.join(', ')).join(', ')}
- Experience: ${resumeData.experience?.map(e => `${e.position} at ${e.company}`).join('; ')}
- Education: ${resumeData.education?.map(e => `${e.degree} from ${e.institution}`).join('; ')}
</USER_PROFILE>

Return ONLY the summary text, no quotes or labels.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};

/**
 * Generate a cover letter
 */
const generateCoverLetter = async (resumeData, jobDescription, companyName) => {
    const prompt = `
Write a professional, personalized cover letter for the following job application.

Applicant: ${resumeData.personalInfo?.fullName}
Company: ${companyName}

Job Description:
<JOB_DESCRIPTION>
${jobDescription}
</JOB_DESCRIPTION>

Resume Summary:
<RESUME_DATA>
- Skills: ${resumeData.skills?.flatMap(s => s.items).join(', ')}
- Experience: ${resumeData.experience?.map(e => `${e.position} at ${e.company}: ${e.description}`).join('; ')}
</RESUME_DATA>

Write a 3-paragraph cover letter that:
1. Opens with enthusiasm and the specific role
2. Highlights 2-3 relevant achievements from the resume
3. Closes with a call to action

Return ONLY the cover letter text.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};

/**
 * Analyze skill gaps between resume and job description
 */
const analyzeSkillGap = async (resumeData, jobDescription) => {
    const prompt = `
Analyze the skill gap between this resume and the job description.

Job Description: 
<JOB_DESCRIPTION>
${jobDescription}
</JOB_DESCRIPTION>

Resume Skills: 
<USER_SKILLS>
${JSON.stringify(resumeData.skills)}
</USER_SKILLS>

Experience: 
<USER_EXPERIENCE>
${resumeData.experience?.map(e => e.description).join(' ')}
</USER_EXPERIENCE>

Return JSON ONLY:
{
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "partiallyMatchedSkills": ["skill1"],
  "recommendedCourses": [{"skill": "skill1", "platform": "Coursera/YouTube/etc", "searchTerm": "course name"}],
  "timeToLearn": "<estimated weeks to bridge the gap>",
  "overallFit": <0-100>
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) return {};
    const jsonStr = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonStr);
};

/**
 * Generate a professional bio (short, for LinkedIn/websites)
 */
const generateBio = async (userData) => {
    const prompt = `
Create a compelling 100-150 word professional bio for the following person.

<USER_DATA>
Name: ${userData.fullName}
Status: ${userData.currentStatus}
Skills: ${userData.skills?.join(', ')}
Location: ${userData.location}
</USER_DATA>

Write in third person. Be professional and engaging.
Return ONLY the bio text.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};

/**
 * Generate interview questions based on a job description
 */
const generateInterviewQuestions = async (jobDescription, difficulty = 'medium') => {
    const prompt = `
Generate 10 interview questions for the following job. Include 3 behavioral, 4 technical, and 3 situational questions.

Job Description: 
<JOB_DESCRIPTION>
${jobDescription}
</JOB_DESCRIPTION>

Difficulty: ${difficulty}

Return JSON ONLY:
{
  "behavioral": [{"question": "...", "tipAnswer": "..."}],
  "technical": [{"question": "...", "tipAnswer": "..."}],
  "situational": [{"question": "...", "tipAnswer": "..."}]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) return {};
    const jsonStr = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonStr);
};

/**
 * Analyze this resume data to optimize the candidate's LinkedIn profile.
 */
const optimizeLinkedInProfile = async (resumeData) => {
    const prompt = `
Analyze this resume data and provide specific, actionable suggestions to optimize the candidate's LinkedIn profile.

<CANDIDATE_DATA>
Profile Summary: ${resumeData.personalInfo?.fullName}
Skills: ${JSON.stringify(resumeData.skills)}
Experience: ${resumeData.experience?.map(e => `${e.position} at ${e.company}: ${e.description}`).join('; ')}
</CANDIDATE_DATA>

Return JSON ONLY:
{
  "headlineSuggestions": ["Option 1", "Option 2", "Option 3"],
  "aboutSection": "<A 3-4 sentence engaging LinkedIn 'About' summary>",
  "keywordsToHighlight": ["keyword1", "keyword2", "keyword3"],
  "networkingTips": ["tip1", "tip2"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const jsonStr = (firstBrace !== -1 && lastBrace !== -1) ? text.substring(firstBrace, lastBrace + 1) : '{}';
    return JSON.parse(jsonStr);
};

/**
 * Act as a senior career coach and provide a career path roadmap
 */
const adviseCareerPath = async (resumeData) => {
    const prompt = `
Act as a senior career coach. Based on this resume, provide a comprehensive structured career trajectory.

<RESUME_DATA>
Current Role: ${resumeData.currentStatus}
Skills: ${JSON.stringify(resumeData.skills)}
Degree/Education: ${JSON.stringify(resumeData.education)}
</RESUME_DATA>

Return JSON ONLY:
{
  "nextLogicalRole": "<Job Title>",
  "estimatedSalaryJump": "<Percentage or generic tier>",
  "roadmap": [
    { "step": "Short-term (0-6 mo)", "action": "Specific skill acquisition or project" },
    { "step": "Medium-term (1-2 yrs)", "action": "Specific promotion or pivot target" },
    { "step": "Long-term (3-5 yrs)", "action": "Ultimate career goal" }
  ],
  "certificationsToPursue": ["Cert 1", "Cert 2"],
  "alternativePivots": ["Role A", "Role B"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const jsonStr = (firstBrace !== -1 && lastBrace !== -1) ? text.substring(firstBrace, lastBrace + 1) : '{}';
    return JSON.parse(jsonStr);
};

/**
 * Summarize a long job description down to its core requirements
 */
const summarizeJobDescription = async (jobDescription) => {
    const prompt = `
Read this long, complicated job description and distil it down to its core requirements.

Job Description:
<JOB_DESCRIPTION>
${jobDescription}
</JOB_DESCRIPTION>

Return JSON ONLY:
{
  "coreFocus": "<1 sentence on what this person will actually do daily>",
  "mandatoryRequirements": ["req1", "req2", "req3", "req4"],
  "niceToHave": ["bonus 1", "bonus 2"],
  "redFlags": ["If any, suspicious expectations from the JD. If none, say 'None detected'"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const jsonStr = (firstBrace !== -1 && lastBrace !== -1) ? text.substring(firstBrace, lastBrace + 1) : '{}';
    return JSON.parse(jsonStr);
};

module.exports = {
    checkAtsScore,
    enhanceResume,
    generateSummary,
    generateCoverLetter,
    analyzeSkillGap,
    generateBio,
    generateInterviewQuestions,
    optimizeLinkedInProfile,
    adviseCareerPath,
    summarizeJobDescription
};
