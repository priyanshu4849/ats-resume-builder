const request = require("supertest");
const app = require("../app");
const { connect, closeDatabase, clearDatabase } = require("./testDb");

beforeAll(connect);
afterEach(clearDatabase);
afterAll(closeDatabase);

async function registerAndGetToken(email = "resumes@example.com") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Resume Tester", email, password: "password123" });
  return res.body.token;
}

describe("POST /api/resumes", () => {
  it("creates a blank resume for the authenticated user", async () => {
    const token = await registerAndGetToken();

    const res = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Resume" });

    expect(res.status).toBe(201);
    expect(res.body.resume.title).toBe("My Resume");
    expect(res.body.resume.source).toBe("scratch");
  });

  it("rejects a missing title", async () => {
    const token = await registerAndGetToken();

    const res = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app).post("/api/resumes").send({ title: "No Auth" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/resumes", () => {
  it("lists only the requesting user's resumes", async () => {
    const tokenA = await registerAndGetToken("userA@example.com");
    const tokenB = await registerAndGetToken("userB@example.com");

    await request(app).post("/api/resumes").set("Authorization", `Bearer ${tokenA}`).send({ title: "A's resume" });
    await request(app).post("/api/resumes").set("Authorization", `Bearer ${tokenB}`).send({ title: "B's resume" });

    const res = await request(app).get("/api/resumes").set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.resumes).toHaveLength(1);
    expect(res.body.resumes[0].title).toBe("A's resume");
  });
});

describe("GET/PATCH/DELETE /api/resumes/:id", () => {
  it("fetches a resume by id", async () => {
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Fetch Me" });

    const res = await request(app)
      .get(`/api/resumes/${created.body.resume._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.resume.title).toBe("Fetch Me");
  });

  it("updates allowed fields", async () => {
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Before" });

    const res = await request(app)
      .patch(`/api/resumes/${created.body.resume._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "After", skills: ["React", "Node.js"] });

    expect(res.status).toBe(200);
    expect(res.body.resume.title).toBe("After");
    expect(res.body.resume.skills).toEqual(["React", "Node.js"]);
  });

  it("deletes a resume", async () => {
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Delete Me" });

    const del = await request(app)
      .delete(`/api/resumes/${created.body.resume._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    const get = await request(app)
      .get(`/api/resumes/${created.body.resume._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(404);
  });

  it("returns 404 (not 403) when accessing another user's resume", async () => {
    const tokenA = await registerAndGetToken("ownerA@example.com");
    const tokenB = await registerAndGetToken("ownerB@example.com");

    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "A's private resume" });

    const res = await request(app)
      .get(`/api/resumes/${created.body.resume._id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });
});
