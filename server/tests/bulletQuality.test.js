const request = require("supertest");
const app = require("../app");
const { connect, closeDatabase, clearDatabase } = require("./testDb");

beforeAll(connect);
afterEach(clearDatabase);
afterAll(closeDatabase);

async function registerAndGetToken(email = "bullet-quality@example.com") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Bullet Tester", email, password: "password123" });
  return res.body.token;
}

describe("GET /api/resumes/:id/bullet-quality", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await request(app).get("/api/resumes/000000000000000000000000/bullet-quality");
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
      .get(`/api/resumes/${created.body.resume._id}/bullet-quality`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });

  it("flags weak bullets and locates them in experience and projects", async () => {
    const token = await registerAndGetToken();
    const created = await request(app)
      .post("/api/resumes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Quality Test" });
    const id = created.body.resume._id;

    await request(app)
      .patch(`/api/resumes/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        experience: [
          {
            company: "TechCorp",
            role: "Intern",
            bullets: [
              "Built a REST API used by 10k+ daily active users",
              "Worked on backend stuff and helped fix bugs",
            ],
          },
        ],
        projects: [{ name: "Side Project", bullets: ["Was responsible for the deployment process"] }],
      });

    const res = await request(app)
      .get(`/api/resumes/${id}/bullet-quality`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.bullets).toHaveLength(3);

    const strongBullet = res.body.bullets.find((b) => b.text.startsWith("Built"));
    expect(strongBullet.section).toBe("experience");
    expect(strongBullet.entryIndex).toBe(0);
    expect(strongBullet.bulletIndex).toBe(0);
    expect(strongBullet.strongVerb).toBe(true);
    expect(strongBullet.issues).not.toContain("Doesn't open with a strong action verb");

    const weakOpenerBullet = res.body.bullets.find((b) => b.text.startsWith("Worked on"));
    expect(weakOpenerBullet.weakOpener).toBe(true);
    expect(weakOpenerBullet.issues.length).toBeGreaterThan(0);

    const projectBullet = res.body.bullets.find((b) => b.section === "projects");
    expect(projectBullet.entryIndex).toBe(0);
    expect(projectBullet.bulletIndex).toBe(0);
  });
});
