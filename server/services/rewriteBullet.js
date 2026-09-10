async function rewriteBullet(bulletText, jobDescription) {
  const prompt = `You are an ATS resume writing coach.

Rewrite the resume bullet point below so it is more ATS-aligned for the given job description: use strong action verbs, include relevant keywords naturally, and quantify impact where plausible.

Return ONLY a valid JSON object (no markdown code fences, no commentary) matching exactly this shape:
{
  "improved": "",
  "reason": ""
}

Rules:
- "improved" is the rewritten bullet point, as a single sentence, starting with a strong action verb.
- "reason" is a short (one sentence) explanation of what changed and why.
- Do not invent specific numbers or achievements that aren't implied by the original bullet. If quantifying isn't plausible, keep it qualitative.
- Output nothing except the JSON object itself.

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
