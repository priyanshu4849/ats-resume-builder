const request = require("supertest");
const app = require("../app");
const rewriteBullet = require("../services/rewriteBullet");
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

describe("rewriteBullet prompt", () => {
  it("only allows tools the original bullet names", async () => {
    const prompts = mockClaudeFetch();

    await rewriteBullet("Fixed bugs", "Needs TypeScript and Jest");

    expect(prompts[0]).toMatch(/Keep every tool, language, framework and library the original bullet names/);
    expect(prompts[0]).toMatch(/Name any tool, language, framework or library the original bullet doesn't name/);
  });
});

// The rewrite can't tell which of the person's skills they used for a given
// piece of work, so the resume's skills must never reach the prompt at all.
describe("rewrite routes don't send the resume's skills to Claude", () => {
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
        skills: ["Tailwind", "MongoDB"],
        projects: [{ name: "Tracker", techStack: ["Redis"], bullets: ["Added login and charts"] }],
      });
    return { token, id };
  }

  const resumeOnlySkills = /Tailwind|MongoDB|Redis/;

  it("POST /:id/rewrite-bullet", async () => {
    const { token, id } = await setup();
    const prompts = mockClaudeFetch();

    const res = await request(app)
      .post(`/api/resumes/${id}/rewrite-bullet`)
      .set("Authorization", `Bearer ${token}`)
      .send({ bulletText: "Added login and charts", jobDescription: "Needs TypeScript" });

    expect(res.status).toBe(200);
    expect(prompts[0]).not.toMatch(resumeOnlySkills);
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
    expect(prompts[0]).not.toMatch(resumeOnlySkills);
  });
});
