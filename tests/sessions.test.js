require('dotenv').config();
const request = require('supertest');
const app = require("../src/app");
const { addSession, editSession } = require("../src/helpers/testExamples");

let readId = 30;
let sessionId

// Get the sessions of a read
describe("GET /sessions/:readId", () => {
  it("should return list of sessions", async () => {
    const res = await request(app)
      .get(`/sessions/${readId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body.length > 0) {
      expect(res.body[0].id).toEqual(expect.any(Number));
      expect(res.body[0].startDate).toEqual(expect.any(String));
      expect(res.body[0].time).toEqual(expect.any(Object));
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/sessions/${readId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Add a new sessions
describe("POST /sessions/:readId", () => {
  it("should add a new session", async () => {
    const res = await request(app)
      .post(`/sessions/${readId}`)
      .send(addSession)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      read_id: expect.any(Number),
      start_date: expect.any(String),
      time: expect.any(Object)
    })

    sessionId = res.body.id
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/sessions/${readId}`)
      .send(addSession)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Edit a session
describe("PUT /sessions/:readId/:sessionId", () => {
  it("should update session details", async () => {
    const res = await request(app)
      .put(`/sessions/${readId}/${sessionId}`)
      .send(editSession)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .put(`/sessions/${readId}/${sessionId}`)
      .send(editSession)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Delete a session
describe("DELETE /sessions/:readId/:sessionId", () => {
  it("should delete a session", async () => {
    const res = await request(app)
      .delete(`/sessions/${readId}/${sessionId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .delete(`/sessions/${readId}/${sessionId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});