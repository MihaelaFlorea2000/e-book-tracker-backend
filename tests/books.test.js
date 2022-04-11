require('dotenv').config();
const request = require('supertest');
const app = require("../src/app");
const { uploadBook, editBook } = require("../src/helpers/testExamples");

let bookId;

// Get the books of the current user
describe("GET /books", () => {
  it("should return list of books", async () => {
    const res = await request(app)
      .get("/books")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body.length > 0) {
      expect(res.body[0].id).toEqual(expect.any(Number));
      expect(res.body[0].userId).toEqual(expect.any(Number));
      expect(res.body[0].title).toEqual(expect.any(String));
      expect(res.body[0].authors).toEqual(expect.any(Array));
      expect(res.body[0].description).toEqual(expect.any(String));
      expect(res.body[0].coverImage === null
        || typeof res.body[0].coverImage === 'string').toBeTruthy();
      expect(res.body[0].publisher).toEqual(expect.any(String));
      expect(res.body[0].pubDate).toEqual(expect.any(String));
      expect(res.body[0].language).toEqual(expect.any(String));
      expect(res.body[0].rating).toEqual(expect.any(Number));
      expect(res.body[0].fileName).toEqual(expect.any(String));
      expect(res.body[0].series).toEqual(expect.any(String));
      expect(res.body[0].location).toEqual(expect.any(String));
      expect(res.body[0].lastOpened).toEqual(expect.any(String));
      expect(res.body[0].tags).toEqual(expect.any(Array));
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/books")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Add a new book
describe("POST /books", () => {
  it("should add a new book", async () => {
    const res = await request(app)
      .post("/books")
      .send(uploadBook)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      user_id: expect.any(Number),
      title: expect.any(String),
      authors: expect.any(Array),
      description: expect.any(String),
      cover_image: expect.nullOrAny(String),
      publisher: expect.any(String),
      pub_date: expect.any(String),
      language: expect.any(String),
      rating: expect.any(Number),
      file: expect.nullOrAny(String),
      file_name: expect.any(String),
      series: expect.any(String),
      location: expect.any(String),
      last_opened: expect.any(String),
      read: expect.nullOrAny(String),
      current_read: expect.nullOrAny(String),
    })

    bookId = res.body.id
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post("/books")
      .send(uploadBook)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get a book
describe("GET /books/:bookId", () => {
  it("should get book details", async () => {
    const res = await request(app)
      .get(`/books/${bookId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(Number),
      userId: expect.any(Number),
      title: expect.any(String),
      authors: expect.any(Array),
      description: expect.any(String),
      coverImage: expect.nullOrAny(String),
      publisher: expect.any(String),
      pubDate: expect.any(String),
      language: expect.any(String),
      rating: expect.any(Number),
      file: expect.nullOrAny(String),
      fileName: expect.any(String),
      series: expect.any(String),
      location: expect.any(String),
      lastOpened: expect.any(String),
      tags: expect.any(Array)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/books/${bookId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Open a book
describe("POST /books/:bookId/opened", () => {
  it("should open a book", async () => {
    const res = await request(app)
      .post(`/books/${bookId}/opened`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/books/${bookId}/opened`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Close a book
describe("POST /books/:bookId/closed", () => {
  it("should close a book", async () => {
    const res = await request(app)
      .post(`/books/${bookId}/closed`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/books/${bookId}/closed`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Finish a book
describe("POST /books/:bookId/finished", () => {
  it("should finish a book", async () => {
    const res = await request(app)
      .post(`/books/${bookId}/finished`)
      .send({rating: 5, notes: "Good book!"})
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/books/${bookId}/finished`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Edit a book
describe("PUT /books/:bookId/edit", () => {
  it("should update book details", async () => {
    const res = await request(app)
      .put(`/books/${bookId}/edit`)
      .send(editBook)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .put(`/books/${bookId}/edit`)
      .send(editBook)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Upload book file and cover to bucket
describe("POST /books/:bookId/edit/upload", () => {
  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/books/${bookId}/edit/upload`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Delete a book
describe("DELETE /books/:bookId", () => {
  it("should delete a book", async () => {
    const res = await request(app)
      .delete(`/books/${bookId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .delete(`/books/${bookId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});