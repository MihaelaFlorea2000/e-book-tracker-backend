require('dotenv').config();
const request = require('supertest');
const app = require("../src/app");
const { addRead, editRead } = require("../src/helpers/testExamples");

let bookId = 17;
let readId

// Get the reads of a book
describe("GET /reads/:bookId", () => {
  it("should return list of reads", async () => {
    const res = await request(app)
      .get(`/reads/${bookId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body.length > 0) {
      expect(res.body[0].id).toEqual(expect.any(Number));
      expect(res.body[0].startDate).toEqual(expect.any(String));
      expect(res.body[0].endDate).toBeOneOf([null, expect.any(String)]);
      expect(res.body[0].rating).toBeOneOf([null, expect.any(Number)]);
      expect(res.body[0].notes).toBeOneOf([null, expect.any(String)]);
      expect(res.body[0].time).toEqual(expect.any(Object));
      expect(res.body[0].sessions).toEqual(expect.any(Number));
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/reads/${bookId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Add a new read
describe("POST /reads/:bookId", () => {
  it("should add a new read", async () => {
    const res = await request(app)
      .post(`/reads/${bookId}`)
      .send(addRead)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      book_id: expect.any(Number),
      user_id: expect.any(Number),
      start_date: expect.any(String),
      end_date: expect.any(String),
      rating: expect.any(Number),
      notes: expect.any(String)
    })

    readId = res.body.id
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/reads/${bookId}`)
      .send(addRead)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get a read
describe("GET /reads/:bookId/:readId", () => {
  it("should get a highlight", async () => {
    const res = await request(app)
      .get(`/reads/${bookId}/${readId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      startDate: expect.any(String),
      endDate: expect.nullOrAny(String),
      rating: expect.nullOrAny(Number),
      notes: expect.nullOrAny(String),
      time: expect.any(Object),
      sessions: expect.any(Number)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/reads/${bookId}/${readId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Edit a read
describe("PUT /reads/:bookId/:readId", () => {
  it("should update read details", async () => {
    const res = await request(app)
      .put(`/reads/${bookId}/${readId}`)
      .send(editRead)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .put(`/reads/${bookId}/${readId}`)
      .send(editRead)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Mark read as finished
describe("POST /reads/:bookId/:readId/finished", () => {
  it("should mark read as finished", async () => {
    const res = await request(app)
      .post(`/reads/${bookId}/${readId}/finished`)
      .send(editRead)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/reads/${bookId}/${readId}/finished`)
      .send(editRead)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Delete a read
describe("DELETE /reads/:bookId/:readId", () => {
  it("should delete a read", async () => {
    const res = await request(app)
      .delete(`/reads/${bookId}/${readId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .delete(`/reads/${bookId}/${readId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});