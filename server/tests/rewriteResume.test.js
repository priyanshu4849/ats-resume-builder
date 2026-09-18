const request = require("supertest");
const app = require("../app");
const { connect, closeDatabase, clearDatabase } = require("./testDb");

beforeAll(connect);
afterEach(async () => {
  await clearDatabase();
  jest.restoreAllMocks();
});
afterAll(closeDatabase);

async function registerAndGetToken(email = "rewrite@example.com") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Rewrite Tester", email, password: "password123" });
  return res.body.token;
}

// Stands in for the real Claude API: rewriteBullet.js sends the original
// bullet text inside a "Original bullet:\n\"\"\"\n<text>\n\"\"\"" block, so we
// pull it back out of the prompt and echo a deterministic "improved" version
// instead of hitting the network — keeps the test fast, free, and offline.
function mockClaudeFetch() {
  return jest.spyOn(global, "fetch").mockImplementation(async (url, options) => {
    const body = JSON.parse(options.body);
    const prompt = body.messages[0].content;
    const match = prompt.match(/Original bullet:\n"""\n([\s\S]*?)\n"""/);
    const original = match ? match[1] : "";
    return {
      ok: true,
      json: async () => ({
        content: [
          {
            text: JSON.stringify({
              improved: `Improved: ${original}`,
              reason: "Added stronger action verbs and relevant keywords",
            }),
          },
        ],
      }),
    };
  });
}

describe("POST /api/resumes/:id/rewrite-resume", () => {
  it("rejects a request missing jobDescription or weakBullets", async () => {
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Missing fields" });

    const res = await request(app)
      .post(`/api/resumes/${created.body.resume._id}/rewrite-resume`)
      .set("Authorization", `Bearer ${token}`)
      .send({ jobDescription: "Some JD" });

    expect(res.status).toBe(400);
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/resumes/000000000000000000000000/rewrite-resume")
      .send({ jobDescription: "JD", weakBullets: [] });

    expect(res.status).toBe(401);
  });

  it("returns 404 for another user's resume", async () => {
    const tokenA = await registerAndGetToken("ownerA@example.com");
    const tokenB = await registerAndGetToken("ownerB@example.com");

    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "A's resume" });

    const res = await request(app)
      .post(`/api/resumes/${created.body.resume._id}/rewrite-resume`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ jobDescription: "JD", weakBullets: [] });

    expect(res.status).toBe(404);
  });

  it("rewrites weak bullets and locates them back in experience/projects", async () => {
    mockClaudeFetch();
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Locate Me" });
    const id = created.body.resume._id;

    await request(app)
      .patch(`/api/resumes/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        experience: [
          { company: "TechCorp", role: "Intern", bullets: ["Worked on backend stuff"] },
        ],
        projects: [{ name: "Side Project", bullets: ["Made a website"] }],
        skills: ["JavaScript"],
      });

    const res = await request(app)
      .post(`/api/resumes/${id}/rewrite-resume`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobDescription: "Backend role needing Node.js and JavaScript",
        weakBullets: [
          { text: "Worked on backend stuff", reason: "too vague" },
          { text: "Made a website", reason: "no impact" },
        ],
        missingKeywords: ["Node.js", "JavaScript"],
      });

    expect(res.status).toBe(200);
    expect(res.body.bulletRewrites).toHaveLength(2);

    const experienceRewrite = res.body.bulletRewrites.find((r) => r.original === "Worked on backend stuff");
    expect(experienceRewrite.improved).toBe("Improved: Worked on backend stuff");
    expect(experienceRewrite.location).toEqual({ section: "experience", entryIndex: 0, bulletIndex: 0 });

    const projectRewrite = res.body.bulletRewrites.find((r) => r.original === "Made a website");
    expect(projectRewrite.location).toEqual({ section: "projects", entryIndex: 0, bulletIndex: 0 });

    // "JavaScript" is already in skills (case-insensitively), so only the
    // genuinely missing keyword should come back as a suggestion.
    expect(res.body.suggestedSkillsToAdd).toEqual(["Node.js"]);
  });

  it("returns a null location when the bullet text no longer matches the resume", async () => {
    mockClaudeFetch();
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Stale Bullet" });
    const id = created.body.resume._id;

    await request(app)
      .patch(`/api/resumes/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ experience: [{ company: "TechCorp", role: "Intern", bullets: ["Edited bullet text"] }] });

    const res = await request(app)
      .post(`/api/resumes/${id}/rewrite-resume`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobDescription: "Backend role",
        weakBullets: [{ text: "Original bullet text before it was edited", reason: "too vague" }],
        missingKeywords: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.bulletRewrites[0].location).toBeNull();
  });
});
