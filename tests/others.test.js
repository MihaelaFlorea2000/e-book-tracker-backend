const request = require('supertest');
const app = require("../src/app");

// Search for books and users
describe("GET /search", () => {
  it("should return search results", async () => {
    const res = await request(app)
      .get("/search?query=A")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.users).toEqual(expect.any(Array))
    if (res.body.users > 0) {
      expect(res.body.users[0]).toMatchObject({
        id: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        profileImage: expect.any(String)
      })
    }

    expect(res.body.books).toEqual(expect.any(Array))
    if (res.body.books > 0) {
      expect(res.body.books[0]).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        coverImage: expect.nullOrAny(String)
      })
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/search?query=A")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get user notifications
describe("GET /notifications", () => {
  it("should return notification list", async () => {
    const res = await request(app)
      .get("/notifications")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body > 0) {
      expect(res.body[0]).toMatchObject({
        senderId: expect.any(Number),
        receiverId: expect.any(Number),
        date: expect.any(String),
        type: expect.any(String),
        image: expect.nullOrAny(String),
        firstName: expect.nullOrAny(String),
        lastName: expect.nullOrAny(String)
      })
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/notifications")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get user badges
describe("GET /badges", () => {
  it("should return badge list", async () => {
    const res = await request(app)
      .get("/badges")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    expect(res.body.length).toEqual(9)
    expect(res.body[0]).toMatchObject({
      id: expect.any(Number),
      type: expect.any(String),
      number: expect.any(Number),
      done: expect.any(Boolean)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/badges")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});