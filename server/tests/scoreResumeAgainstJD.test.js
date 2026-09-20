const scoreResumeAgainstJD = require("../services/scoreResumeAgainstJD");

const sampleResume = {
  skills: ["JavaScript"],
  experience: [{ company: "TechCorp", role: "Intern", bullets: ["Built a REST API"] }],
  projects: [],
};

function mockClaudeOnce(responseText, stopReason = "end_turn") {
  return { ok: true, json: async () => ({ content: [{ text: responseText }], stop_reason: stopReason }) };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("scoreResumeAgainstJD", () => {
  it("parses a normal JSON response", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      mockClaudeOnce(
        JSON.stringify({
          matchScore: 80,
          matchedKeywords: ["JavaScript"],
          missingKeywords: ["Node.js"],
          weakBullets: [],
        })
      )
    );

    const result = await scoreResumeAgainstJD(sampleResume, "JD needing JavaScript and Node.js");

    expect(result.matchScore).toBe(80);
    expect(result.matchedKeywords).toEqual(["JavaScript"]);
    expect(result.missingKeywords).toEqual(["Node.js"]);
  });

  it("strips markdown code fences before parsing", async () => {
    const fenced = "```json\n" + JSON.stringify({ matchScore: 50, matchedKeywords: [], missingKeywords: [], weakBullets: [] }) + "\n```";
    jest.spyOn(global, "fetch").mockResolvedValue(mockClaudeOnce(fenced));

    const result = await scoreResumeAgainstJD(sampleResume, "JD");

    expect(result.matchScore).toBe(50);
  });

  it("retries once and succeeds if the second attempt returns valid JSON", async () => {
    const good = JSON.stringify({ matchScore: 60, matchedKeywords: [], missingKeywords: [], weakBullets: [] });
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(mockClaudeOnce("this is not json at all"))
      .mockResolvedValueOnce(mockClaudeOnce(good));

    const result = await scoreResumeAgainstJD(sampleResume, "JD");

    expect(result.matchScore).toBe(60);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("throws after both attempts return malformed JSON", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(mockClaudeOnce("still not json"));

    await expect(scoreResumeAgainstJD(sampleResume, "JD")).rejects.toThrow(
      "Claude did not return a parseable JSON object"
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("flags a truncated response distinctly from a malformed one", async () => {
    const truncated = '{"matchScore": 70, "matchedKeywords": ["Java';
    jest.spyOn(global, "fetch").mockResolvedValue(mockClaudeOnce(truncated, "max_tokens"));

    await expect(scoreResumeAgainstJD(sampleResume, "JD")).rejects.toThrow(
      "Claude's response was cut off before it finished (hit the token limit)"
    );
  });
});
