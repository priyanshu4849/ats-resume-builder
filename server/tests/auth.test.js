const request = require("supertest");
const app = require("../app");
const { connect, closeDatabase, clearDatabase } = require("./testDb");

beforeAll(connect);
afterEach(clearDatabase);
afterAll(closeDatabase);

const validUser = { name: "Test User", email: "test@example.com", password: "password123" };

describe("POST /api/auth/register", () => {
  it("creates a user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toMatchObject({ name: validUser.name, email: validUser.email });
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(409);
  });

  it("rejects a missing field", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validUser);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it("rejects a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/users/me", () => {
  it("returns the user when a valid token is sent", async () => {
    const register = await request(app).post("/api/auth/register").send(validUser);
    const token = register.body.token;

    const res = await request(app).get("/api/users/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it("rejects a request with no token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });
});
