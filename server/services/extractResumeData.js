async function extractResumeData(resumeText) {
  const prompt = `You are extracting structured data from a resume's raw text.

Return ONLY a valid JSON object (no markdown code fences, no commentary) matching exactly this shape:
{
  "personalInfo": { "name": "", "email": "", "phone": "", "linkedin": "", "github": "" },
  "education": [ { "school": "", "degree": "", "startDate": "", "endDate": "", "gpa": "" } ],
  "experience": [ { "company": "", "role": "", "startDate": "", "endDate": "", "bullets": [""] } ],
  "projects": [ { "name": "", "techStack": [""], "bullets": [""], "link": "" } ],
  "skills": [""]
}

Rules:
- Split each experience/project description into individual bullet points, one achievement per string.
- If a field isn't present in the resume, leave it as an empty string or empty array. Do not invent information.
- Output nothing except the JSON object itself.

Resume text:
"""
${resumeText}
"""`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data.content[0].text;

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude did not return a parseable JSON object");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error("Failed to parse JSON returned by Claude");
  }

  return {
    personalInfo: parsed.personalInfo || {},
    education: parsed.education || [],
    experience: parsed.experience || [],
    projects: parsed.projects || [],
    skills: parsed.skills || [],
  };
}

module.exports = extractResumeData;
