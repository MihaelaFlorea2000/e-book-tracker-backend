require('dotenv').config();
const request = require('supertest');
const app = require("../src/app");
const { registerUser, editGoals } = require("../src/helpers/testExamples");

let userId = 11
let token

// User Register
describe("POST /users/register", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/users/register")
      .send(registerUser)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return passwords don't match", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "john_doe@yahoo.com",
        password: "1234",
        confirmPassword: "4321"
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Passwords don't match");
  });

  it("should return email already exists", async () => {
    const res = await request(app)
      .post("/users/register")
      .send(registerUser)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Email already exists");
  });
});

// Valid User Login and Delete
describe("POST /users/login", () => {
  it("should login a user", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({
        email: "john_doe@yahoo.com",
        password: "1234"
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
    expect(res.body.token).not.toBe(false);

    token = `Bearer ${res.body.token}`
  });

  it("should return invalid credentials", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({
        email: "random@yahoo.com",
        password: "1234"
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Invalid credentials");
    expect(res.body.token).toBe(false);
  });
});

// Edit user goals
describe("POST /users/goals", () => {
  it("should update user goals", async () => {
    const res = await request(app)
      .post("/users/goals")
      .send(editGoals)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return invalid credentials", async () => {
    const res = await request(app)
      .post("/users/goals")
      .send(editGoals)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get current user information
describe("GET /users/currentUser", () => {
  it("should return current user information", async () => {
    const res = await request(app)
      .get("/users/currentUser")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
      profileImage: expect.any(String)
    }))
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/users/currentUser")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get user information
describe("GET /users/:userId", () => {
  it("should return user information", async () => {
    const res = await request(app)
      .get(`/users/${userId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
      profileImage: expect.any(String),
      isFriend: expect.any(Boolean),
      sentRequest: expect.any(Boolean),
      receivedRequest: expect.any(Boolean)
    }))
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/users/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get user books
describe("GET /users/:userId/books", () => {
  it("should return user books", async () => {
    const res = await request(app)
      .get(`/users/${userId}/books`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body.length > 0) {
      expect(res.body[0].id).toEqual(expect.any(Number));
      expect(res.body[0].title).toEqual(expect.any(String));
      expect(res.body[0].coverImage === null 
        || typeof res.body[0].coverImage === 'string').toBeTruthy();
      expect(res.body[0].tags).toEqual(expect.any(Array))
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/users/${userId}/books`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Invalid User Login and Delete
describe("DELETE /users/settings/delete", () => {
  it("should delete user account", async () => {
    const res = await request(app)
      .delete("/users/settings/delete")
      .set("Accept", "application/json")
      .set("Authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .delete("/users/settings/delete")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});
