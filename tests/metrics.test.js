require('dotenv').config();
const request = require('supertest');
const app = require("../src/app");

let userId = 11

// Get number metrics for the current user
describe("GET /metrics/numbers", () => {
  it("should return object with numbered metrics", async () => {
    const res = await request(app)
      .get("/metrics/numbers")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      booksRead: expect.any(Number),
      booksCurrRead: expect.any(Number),
      authorsReadCount: expect.any(Number),
      longestSession: expect.any(Object),
      avgTimePerSession: expect.any(Object),
      bestDay: expect.any(String)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/numbers")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get number metrics for a user
describe("GET /metrics/numbers/:userId", () => {
  it("should return object with numbered metrics", async () => {
    const res = await request(app)
      .get(`/metrics/numbers/${userId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      booksRead: expect.any(Number),
      booksCurrRead: expect.any(Number),
      authorsReadCount: expect.any(Number),
      longestSession: expect.any(Object),
      avgTimePerSession: expect.any(Object),
      bestDay: expect.any(String)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/metrics/numbers/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get percentage of books read
describe("GET /metrics/percentage", () => {
  it("should return object with percentage of books read", async () => {
    const res = await request(app)
      .get("/metrics/percentage")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      booksRead: expect.any(Number),
      totalBooks: expect.any(Number),
      value: expect.any(Number)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/percentage")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get progress against current user goals
describe("GET /metrics/goals", () => {
  it("should return object with progress against goals", async () => {
    const res = await request(app)
      .get("/metrics/goals")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      set: expect.objectContaining({
        yearly: expect.any(Number),
        monthly: expect.any(Number),
        dailyHours: expect.any(Number),
        dailyMinutes: expect.any(Number)
      }),
      done: expect.objectContaining({
        yearly: expect.any(Number),
        monthly: expect.any(Number),
        dailyHours: expect.any(Number),
        dailyMinutes: expect.any(Number)
      }),
      percentage: expect.objectContaining({
        yearly: expect.any(Number),
        monthly: expect.any(Number),
        daily: expect.any(Number)
      })
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/goals")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get progress against user goals
describe("GET /metrics/goals/:userId", () => {
  it("should return object with progress against goals", async () => {
    const res = await request(app)
      .get(`/metrics/goals/${userId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      set: expect.objectContaining({
        yearly: expect.any(Number),
        monthly: expect.any(Number),
        dailyHours: expect.any(Number),
        dailyMinutes: expect.any(Number)
      }),
      done: expect.objectContaining({
        yearly: expect.any(Number),
        monthly: expect.any(Number),
        dailyHours: expect.any(Number),
        dailyMinutes: expect.any(Number)
      }),
      percentage: expect.objectContaining({
        yearly: expect.any(Number),
        monthly: expect.any(Number),
        daily: expect.any(Number)
      })
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/metrics/goals/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get user progress over a week
describe("GET /metrics/weekly", () => {
  it("should return object progress over a week", async () => {
    const res = await request(app)
      .get("/metrics/weekly")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.labels)
    .toEqual(expect.arrayContaining(
      [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
      ]
    ))

    expect(res.body.dataValues)
    .toEqual(Array(7).fill(expect.any(Number)))
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/weekly")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get user progress over a month
describe("GET /metrics/monthly", () => {
  it("should return object progress over a month", async () => {
    const res = await request(app)
      .get("/metrics/monthly")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.labels)
      .toEqual(Array(31).fill(expect.any(String)))

    expect(res.body.dataValues)
      .toEqual(Array(31).fill(expect.any(Number)))
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/monthly")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get user progress over a year
describe("GET /metrics/yearly", () => {
  it("should return object progress over a year", async () => {
    const res = await request(app)
      .get("/metrics/yearly")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.labels)
      .toEqual(expect.arrayContaining(
        [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ]
      ))

    expect(res.body.dataValues)
      .toEqual(Array(12).fill(expect.any(Number)))
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/yearly")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get total user progress
describe("GET /metrics/total", () => {
  it("should return object total progress", async () => {
    const res = await request(app)
      .get("/metrics/total")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      labels: expect.any(Array),
      dataValues: expect.any(Array)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/total")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get calendar dates
describe("GET /metrics/calendar", () => {
  it("should return object of date strings", async () => {
    const res = await request(app)
      .get("/metrics/calendar")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/calendar")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get tags by read time
describe("GET /metrics/tags/read", () => {
  it("should return object of tags by read time", async () => {
    const res = await request(app)
      .get("/metrics/tags/read")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      labels: expect.any(Array),
      dataValues: expect.any(Array)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/tags/read")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get tags by books owned
describe("GET /metrics/tags/books", () => {
  it("should return object of tags by books owned", async () => {
    const res = await request(app)
      .get("/metrics/tags/books")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      labels: expect.any(Array),
      dataValues: expect.any(Array)
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/metrics/tags/books")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});