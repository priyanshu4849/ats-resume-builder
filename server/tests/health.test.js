const request = require("supertest");
const app = require("../app");

describe("GET /api/health", () => {
  it("responds ok without touching the database", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("tells browsers not to cache the response", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["cache-control"]).toBe("no-store");
  });
});
