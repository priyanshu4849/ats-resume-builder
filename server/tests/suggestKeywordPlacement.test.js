const request = require("supertest");
const app = require("../app");
const { connect, closeDatabase, clearDatabase } = require("./testDb");

beforeAll(connect);
afterEach(async () => {
  await clearDatabase();
  jest.restoreAllMocks();
});
afterAll(closeDatabase);

async function registerAndGetToken(email = "keyword-placement@example.com") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Keyword Tester", email, password: "password123" });
  return res.body.token;
}

function mockClaudeFetch(responseBody) {
  return jest.spyOn(global, "fetch").mockImplementation(async () => ({
    ok: true,
    json: async () => ({ content: [{ text: JSON.stringify(responseBody) }] }),
  }));
}

describe("POST /api/resumes/:id/suggest-keyword-placement", () => {
  it("rejects a request missing keyword or jobDescription", async () => {
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Missing fields" });

    const res = await request(app)
      .post(`/api/resumes/${created.body.resume._id}/suggest-keyword-placement`)
      .set("Authorization", `Bearer ${token}`)
      .send({ keyword: "Docker" });

    expect(res.status).toBe(400);
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/resumes/000000000000000000000000/suggest-keyword-placement")
      .send({ keyword: "Docker", jobDescription: "JD" });

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
      .post(`/api/resumes/${created.body.resume._id}/suggest-keyword-placement`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ keyword: "Docker", jobDescription: "JD" });

    expect(res.status).toBe(404);
  });

  it("returns a skills placement suggestion", async () => {
    mockClaudeFetch({
      location: "skills",
      bulletText: null,
      suggestion: "Add Docker as a standalone skill.",
    });
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Resume" });

    const res = await request(app)
      .post(`/api/resumes/${created.body.resume._id}/suggest-keyword-placement`)
      .set("Authorization", `Bearer ${token}`)
      .send({ keyword: "Docker", jobDescription: "Backend role needing Docker" });

    expect(res.status).toBe(200);
    expect(res.body.suggestion).toEqual({
      location: "skills",
      bulletText: null,
      suggestion: "Add Docker as a standalone skill.",
    });
  });

  it("returns a bullet placement suggestion", async () => {
    mockClaudeFetch({
      location: "bullet",
      bulletText: "Built a REST API used by 10k+ daily active users",
      suggestion: "Mention Docker was used to containerize this API.",
    });
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Resume" });

    const res = await request(app)
      .post(`/api/resumes/${created.body.resume._id}/suggest-keyword-placement`)
      .set("Authorization", `Bearer ${token}`)
      .send({ keyword: "Docker", jobDescription: "Backend role needing Docker" });

    expect(res.status).toBe(200);
    expect(res.body.suggestion.location).toBe("bullet");
    expect(res.body.suggestion.bulletText).toBe("Built a REST API used by 10k+ daily active users");
  });

  it("falls back to skills if the model returns an unrecognized location", async () => {
    mockClaudeFetch({ location: "somewhere-else", bulletText: "irrelevant", suggestion: "..." });
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Resume" });

    const res = await request(app)
      .post(`/api/resumes/${created.body.resume._id}/suggest-keyword-placement`)
      .set("Authorization", `Bearer ${token}`)
      .send({ keyword: "Docker", jobDescription: "JD" });

    expect(res.status).toBe(200);
    expect(res.body.suggestion.location).toBe("skills");
    expect(res.body.suggestion.bulletText).toBeNull();
  });
});
