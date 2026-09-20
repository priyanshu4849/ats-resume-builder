function buildResumeSummary(resume) {
  const experienceBullets = resume.experience.flatMap((exp) => exp.bullets);
  const projectBullets = resume.projects.flatMap((proj) => proj.bullets);

  return {
    skills: resume.skills,
    experience: resume.experience.map((exp) => ({
      company: exp.company,
      role: exp.role,
      bullets: exp.bullets,
    })),
    projects: resume.projects.map((proj) => ({
      name: proj.name,
      techStack: proj.techStack,
      bullets: proj.bullets,
    })),
    allBullets: [...experienceBullets, ...projectBullets],
  };
}

// Claude sometimes ignores "no markdown fences" and wraps its answer in
// ```json ... ``` anyway — strip that before hunting for the JSON object.
function stripCodeFences(text) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
}

async function callClaudeForScore(prompt) {
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
  const rawText = stripCodeFences(data.content[0].text.trim());

  if (data.stop_reason === "max_tokens") {
    throw new Error("Claude's response was cut off before it finished (hit the token limit)");
  }

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude did not return a parseable JSON object");
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    // Keep the raw text in the server logs — the error shown to the user
    // can't include it (too noisy), but it's exactly what you'd want to see
    // on Render's log tab if this happens again.
    console.error("Failed to parse JSON from Claude (scoreResumeAgainstJD):", rawText);
    throw new Error("Failed to parse JSON returned by Claude");
  }
}

async function scoreResumeAgainstJD(resume, jobDescription) {
  const resumeSummary = buildResumeSummary(resume);

  const prompt = `You are an ATS (Applicant Tracking System) resume evaluator.

Compare the resume data below against the job description. Return ONLY a valid JSON object (no markdown code fences, no commentary) matching exactly this shape:
{
  "matchScore": 0,
  "matchedKeywords": [""],
  "missingKeywords": [""],
  "weakBullets": [ { "text": "", "reason": "" } ]
}

Rules:
- "matchScore" is an integer from 0 to 100 representing how well the resume matches the job description's requirements.
- "matchedKeywords" lists important skills/technologies/terms from the job description that ARE present in the resume (in skills, bullets, or elsewhere).
- "missingKeywords" lists important skills/technologies/terms from the job description that are absent from the resume.
- "weakBullets" identifies up to 3 existing bullet points (copy them exactly from "allBullets" below) that are vague, unquantified, or don't align with the job description, along with a short reason why each is weak.
- Output nothing except the JSON object itself.

Resume data:
${JSON.stringify(resumeSummary, null, 2)}

Job description:
"""
${jobDescription}
"""`;

  // Malformed JSON from an LLM is usually a one-off generation hiccup, not a
  // persistent problem — one retry clears most of them without the user
  // having to click Analyze again themselves.
  let parsed;
  try {
    parsed = await callClaudeForScore(prompt);
  } catch (err) {
    parsed = await callClaudeForScore(prompt);
  }

  return {
    matchScore: typeof parsed.matchScore === "number" ? parsed.matchScore : 0,
    matchedKeywords: parsed.matchedKeywords || [],
    missingKeywords: parsed.missingKeywords || [],
    weakBullets: parsed.weakBullets || [],
  };
}

module.exports = scoreResumeAgainstJD;
