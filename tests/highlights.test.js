require('dotenv').config();
const request = require('supertest');
const app = require("../src/app");
const { 
  addHighlight, 
  editHighlight 
} = require("../src/helpers/testExamples");

let bookId = 17
let highlightId

// Get the highlights of a book
describe("GET /highlights/:bookId", () => {
  it("should return list of highlights", async () => {
    const res = await request(app)
      .get(`/highlights/${bookId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body.length > 0) {
      expect(res.body[0].id).toEqual(expect.any(Number));
      expect(res.body[0].bookId).toEqual(expect.any(Number));
      expect(res.body[0].text).toEqual(expect.any(String));
      expect(res.body[0].cfiRange).toEqual(expect.any(String));
      expect(res.body[0].color).toEqual(expect.any(String));
      expect(res.body[0].note).toEqual(expect.any(String));
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/highlights/${bookId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Add a new highlight
describe("POST /highlights/:bookId", () => {
  it("should add a new highlight", async () => {
    const res = await request(app)
      .post(`/highlights/${bookId}`)
      .send(addHighlight)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      book_id: expect.any(Number),
      text: expect.any(String),
      cfi_range: expect.any(String),
      color: expect.any(String),
      note: expect.any(String)
    })

    highlightId = res.body.id
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/highlights/${bookId}`)
      .send(addHighlight)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get a highlight
describe("GET /highlights/:bookId/:highlightId", () => {
  it("should get a highlight", async () => {
    const res = await request(app)
      .get(`/highlights/${bookId}/${highlightId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      bookId: expect.any(Number),
      text: expect.any(String),
      cfiRange: expect.any(String),
      color: expect.any(String),
      note: expect.any(String)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/highlights/${bookId}/${highlightId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Edit a highlight
describe("PUT /highlights/:bookId/:highlightId", () => {
  it("should update highlight details", async () => {
    const res = await request(app)
      .put(`/highlights/${bookId}/${highlightId}`)
      .send(editHighlight)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .put(`/highlights/${bookId}/${highlightId}`)
      .send(editHighlight)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Delete a highlight
describe("DELETE /highlights/:bookId/:highlightId", () => {
  it("should delete a highlight", async () => {
    const res = await request(app)
      .delete(`/highlights/${bookId}/${highlightId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .delete(`/highlights/${bookId}/${highlightId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});