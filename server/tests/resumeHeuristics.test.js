const { analyzeBullet } = require("../services/resumeHeuristics");

describe("analyzeBullet", () => {
  it("names the actual matched filler phrase, not a hardcoded example", () => {
    // Regression test: the issue message used to always say '"responsible for"'
    // regardless of which weak opener actually matched.
    const result = analyzeBullet("Helped with various backend tasks and bug fixes");
    expect(result.weakOpener).toBe(true);
    expect(result.issues).toContain('Starts with a filler phrase ("helped with")');
    expect(result.issues).not.toContain('Starts with a filler phrase ("responsible for")');
  });

  it("flags a different weak opener with its own matched phrase", () => {
    const result = analyzeBullet("Responsible for maintaining the internal admin dashboard");
    expect(result.weakOpener).toBe(true);
    expect(result.issues).toContain('Starts with a filler phrase ("responsible for")');
  });

  it("does not flag a missing action verb when a weak opener already explains the issue", () => {
    const result = analyzeBullet("Worked on backend stuff");
    expect(result.weakOpener).toBe(true);
    expect(result.strongVerb).toBe(false);
    expect(result.issues).not.toContain("Doesn't open with a strong action verb");
  });

  it("has no issues for a strong, quantified bullet", () => {
    const result = analyzeBullet("Built a REST API used by 10k+ daily active users, reducing latency by 35%");
    expect(result.strongVerb).toBe(true);
    expect(result.quantified).toBe(true);
    expect(result.weakOpener).toBe(false);
    expect(result.issues).toEqual([]);
  });

  it("flags a bullet with no strong verb and no number", () => {
    const result = analyzeBullet("Familiar with several backend frameworks");
    expect(result.issues).toContain("Doesn't open with a strong action verb");
    expect(result.issues).toContain("No quantified impact (a number, %, or metric)");
  });
});
