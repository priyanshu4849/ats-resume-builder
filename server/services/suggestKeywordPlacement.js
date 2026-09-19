function buildResumeSummary(resume) {
  const experienceBullets = (resume.experience || []).flatMap((exp) => exp.bullets || []);
  const projectBullets = (resume.projects || []).flatMap((proj) => proj.bullets || []);

  return {
    skills: resume.skills || [],
    allBullets: [...experienceBullets, ...projectBullets],
  };
}

async function suggestKeywordPlacement(resume, keyword, jobDescription) {
  const resumeSummary = buildResumeSummary(resume);

  const prompt = `You are an ATS resume writing coach.

A job description asks for "${keyword}", which is missing from this resume. Decide the single best place to add it honestly (never invent experience that isn't implied by the existing content).

Return ONLY a valid JSON object (no markdown code fences, no commentary) matching exactly this shape:
{
  "location": "skills",
  "bulletText": null,
  "suggestion": ""
}

Rules:
- "location" is either "skills" (add it as a standalone skill) or "bullet" (rework one existing bullet to naturally mention it).
- If "location" is "bullet", "bulletText" must be one of the strings in "allBullets" below, copied exactly.
- If "location" is "skills", "bulletText" must be null.
- "suggestion" is one short sentence telling the person exactly how to add it (e.g. what to add to the bullet, or that it's a genuine standalone skill).
- Prefer "bullet" only when the keyword plausibly relates to work already described in that bullet. Otherwise use "skills".
- Output nothing except the JSON object itself.

Resume skills: ${JSON.stringify(resumeSummary.skills)}

Resume bullets (allBullets):
${JSON.stringify(resumeSummary.allBullets, null, 2)}

Job description:
"""
${jobDescription}
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
      max_tokens: 300,
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

  const location = parsed.location === "bullet" ? "bullet" : "skills";
  return {
    location,
    bulletText: location === "bullet" ? parsed.bulletText || null : null,
    suggestion: parsed.suggestion || "",
  };
}

module.exports = suggestKeywordPlacement;
