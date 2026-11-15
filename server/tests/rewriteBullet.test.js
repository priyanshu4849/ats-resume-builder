const request = require("supertest");
const app = require("../app");
const rewriteBullet = require("../services/rewriteBullet");
const { knownSkillsFromResume } = rewriteBullet;
const { connect, closeDatabase, clearDatabase } = require("./testDb");

beforeAll(connect);
afterEach(async () => {
  await clearDatabase();
  jest.restoreAllMocks();
});
afterAll(closeDatabase);

// Records every prompt sent to "Claude" and answers with a fixed rewrite,
// so the tests can check what the prompt contained without a real API call.
function mockClaudeFetch() {
  const prompts = [];
  jest.spyOn(global, "fetch").mockImplementation(async (url, options) => {
    prompts.push(JSON.parse(options.body).messages[0].content);
    return {
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify({ improved: "Resolved UI bugs", reason: "Clearer verb" }) }],
      }),
    };
  });
  return prompts;
}

function skillsBlock(prompt) {
  const match = prompt.match(/Their skills \(from their resume\):\n"""\n([\s\S]*?)\n"""/);
  return match ? match[1] : null;
}

describe("knownSkillsFromResume", () => {
  it("combines the skills section with every project's tech stack", () => {
    const resume = {
      skills: ["JavaScript", "React"],
      projects: [{ techStack: ["Node.js", "MongoDB"] }, { techStack: ["Express"] }],
    };

    expect(knownSkillsFromResume(resume)).toEqual(["JavaScript", "React", "Node.js", "MongoDB", "Express"]);
  });

  it("drops duplicates regardless of case, and blank entries", () => {
    const resume = { skills: ["React", " react ", ""], projects: [{ techStack: ["REACT", "Git"] }] };

    expect(knownSkillsFromResume(resume)).toEqual(["React", "Git"]);
  });

  it("returns an empty list for a resume with no skills or projects", () => {
    expect(knownSkillsFromResume({})).toEqual([]);
    expect(knownSkillsFromResume(undefined)).toEqual([]);
  });
});

describe("rewriteBullet prompt", () => {
  it("includes the person's skills so the rewrite can't borrow tools from the job description", async () => {
    const prompts = mockClaudeFetch();

    await rewriteBullet("Fixed bugs", "Needs TypeScript and Jest", ["JavaScript", "React"]);

    expect(skillsBlock(prompts[0])).toBe("JavaScript, React");
    expect(prompts[0]).toMatch(/Name a tool, language or framework only if it appears in the original bullet or in their skills list/);
  });

  it("says no skills are listed when the resume has none", async () => {
    const prompts = mockClaudeFetch();

    await rewriteBullet("Fixed bugs", "Needs TypeScript");

    expect(skillsBlock(prompts[0])).toBe("(none listed)");
  });
});

describe("rewrite routes send the resume's own skills", () => {
  async function setup() {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "Skills Tester", email: "skills@example.com", password: "password123" });
    const token = reg.body.token;
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Skills resume" });
    const id = created.body.resume._id;
    await request(app)
      .patch(`/api/resumes/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        skills: ["JavaScript", "React"],
        projects: [{ name: "Tracker", techStack: ["MongoDB"], bullets: ["Added login and charts"] }],
      });
    return { token, id };
  }

  it("POST /:id/rewrite-bullet", async () => {
    const { token, id } = await setup();
    const prompts = mockClaudeFetch();

    const res = await request(app)
      .post(`/api/resumes/${id}/rewrite-bullet`)
      .set("Authorization", `Bearer ${token}`)
      .send({ bulletText: "Added login and charts", jobDescription: "Needs TypeScript" });

    expect(res.status).toBe(200);
    expect(skillsBlock(prompts[0])).toBe("JavaScript, React, MongoDB");
  });

  it("POST /:id/rewrite-resume", async () => {
    const { token, id } = await setup();
    const prompts = mockClaudeFetch();

    const res = await request(app)
      .post(`/api/resumes/${id}/rewrite-resume`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobDescription: "Needs TypeScript",
        weakBullets: [{ text: "Added login and charts", reason: "Vague" }],
        missingKeywords: ["TypeScript"],
      });

    expect(res.status).toBe(200);
    expect(skillsBlock(prompts[0])).toBe("JavaScript, React, MongoDB");
  });
});
