// Every skill the resume gives evidence for: the skills section plus each
// project's tech stack. The rewrite prompt may only name tools from this list
// (or from the bullet itself), so it can't borrow skills from the job posting.
function knownSkillsFromResume(resume) {
  const all = [
    ...(resume?.skills || []),
    ...(resume?.projects || []).flatMap((project) => project.techStack || []),
  ];
  const seen = new Set();
  return all
    .map((skill) => String(skill).trim())
    .filter((skill) => {
      const key = skill.toLowerCase();
      if (!skill || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function rewriteBullet(bulletText, jobDescription, knownSkills = []) {
  const skillsLine = knownSkills.length ? knownSkills.join(", ") : "(none listed)";

  const prompt = `You are helping someone improve one bullet point on their resume for a specific job.

They will send this resume to employers and can be asked about any line of it in an interview, so every claim in the rewrite has to be true. All you know about their work is what the original bullet says and the skills listed on their resume. Treat everything else as unknown, even when the job description asks for it.

What you should do:
- Start with a strong action verb and make the wording clearer and more specific.
- Where the bullet already describes something the job description asks for, use the job description's wording for it. For example, "fixed bugs in the frontend" can become "resolved UI bugs" when the job mentions UI bugs.
- Name a tool, language or framework only if it appears in the original bullet or in their skills list below, and only where it fits the work the bullet describes.

What you must not do:
- Add a tool, language, framework or practice that is in neither the bullet nor the skills list just because the job description mentions it. That includes testing, code reviews, accessibility work and performance work. Leave unmatched job keywords out: the app shows missing keywords to the person separately so they can decide what's true for them.
- Add numbers, results or improvements the bullet doesn't state or clearly imply.
- Make the work sound bigger than it was. If the original is vague, the rewrite should be clearer, not grander.

Return ONLY a valid JSON object (no markdown code fences, no commentary) matching exactly this shape:
{
  "improved": "",
  "reason": ""
}

- "improved" is the rewritten bullet as a single sentence.
- "reason" is one short sentence explaining what changed and why.
- Output nothing except the JSON object itself.

Their skills (from their resume):
"""
${skillsLine}
"""

Original bullet:
"""
${bulletText}
"""

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
      max_tokens: 512,
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
    original: bulletText,
    improved: parsed.improved || "",
    reason: parsed.reason || "",
  };
}

module.exports = rewriteBullet;
module.exports.knownSkillsFromResume = knownSkillsFromResume;
