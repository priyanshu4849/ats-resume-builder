const crypto = require("crypto");
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
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

describe("POST /api/auth/forgot-password", () => {
  it("returns the same generic message whether or not the email exists", async () => {
    await request(app).post("/api/auth/register").send(validUser);

    const existing = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: validUser.email });
    const nonexistent = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nobody@example.com" });

    expect(existing.status).toBe(200);
    expect(nonexistent.status).toBe(200);
    expect(existing.body.message).toBe(nonexistent.body.message);
  });

  it("stores a hashed reset token on the user when the email exists", async () => {
    const register = await request(app).post("/api/auth/register").send(validUser);
    await request(app).post("/api/auth/forgot-password").send({ email: validUser.email });

    const user = await User.findById(register.body.user.id).select("+resetPasswordToken");
    expect(user.resetPasswordToken).toBeTruthy();
  });
});

describe("POST /api/auth/reset-password", () => {
  async function setResetToken(userId, rawToken, expiresInMs = 60 * 60 * 1000) {
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    await User.findByIdAndUpdate(userId, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: Date.now() + expiresInMs,
    });
  }

  it("resets the password with a valid token and lets the user log in with it", async () => {
    const register = await request(app).post("/api/auth/register").send(validUser);
    await setResetToken(register.body.user.id, "valid-raw-token");

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "valid-raw-token", password: "newpassword123" });
    expect(res.status).toBe(200);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "newpassword123" });
    expect(login.status).toBe(200);
  });

  it("rejects an expired token", async () => {
    const register = await request(app).post("/api/auth/register").send(validUser);
    await setResetToken(register.body.user.id, "expired-token", -1000);

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "expired-token", password: "newpassword123" });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "made-up-token", password: "newpassword123" });
    expect(res.status).toBe(400);
  });
});
