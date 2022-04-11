require('dotenv').config();
const request = require('supertest');
const app = require("../src/app");

let userId = 11
let mutualId = 32
let newFriendId = 10
let acceptFriendId = 12
let rejectFriendId = 2

// Get the current user's friends
describe("GET /friends", () => {
  it("should return list of friends", async () => {
    const res = await request(app)
      .get("/friends")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body.length > 0) {
      expect(res.body[0]).toMatchObject({
        id: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        profileImage: expect.any(String)
      })
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/friends")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get the current user's friend requests
describe("GET /friends/requests", () => {
  it("should return list of friend requests", async () => {
    const res = await request(app)
      .get("/friends/requests")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body.length > 0) {
      expect(res.body[0]).toMatchObject({
        requestId: expect.any(Number),
        requestDate: expect.any(String),
        senderId: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        profileImage: expect.any(String)
      })
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/friends/requests")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Send friend requests
describe("POST /friends/requests", () => {
  it("should send 3 friend requests", async () => {
    const res = await request(app)
      .post("/friends/requests")
      .send({ receiverId: newFriendId })
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body > 0) {
      expect(res.body[0]).toMatchObject({
        id: expect.any(Number),
        sender_id: expect.any(Number),
        receiver_id: expect.any(Number),
        date: expect.any(String),
        type: expect.nullOrAny(String)
      })
    }

    const resAccept = await request(app)
      .post("/friends/requests")
      .send({ receiverId: acceptFriendId })
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)

    acceptReqId = resAccept.body[0].id
    
    const resReject = await request(app)
      .post("/friends/requests")
      .send({ receiverId: rejectFriendId })
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)

    rejectReqId = resReject.body[0].id
  });

  it("should return already friends", async () => {
    const res = await request(app)
      .post("/friends/requests")
      .send({ receiverId: newFriendId })
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(400)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Already friends");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post("/friends/requests")
      .send({ receiverId: newFriendId })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Unsend friend request
describe("DELETE /friends/requests/:friendId", () => {
  it("should unsend a friend request", async () => {
    const res = await request(app)
      .delete(`/friends/requests/${newFriendId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .delete(`/friends/requests/${newFriendId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Accept friend request
describe("POST /friends/requests/:friendId", () => {
  it("should accept friend request", async () => {
    const res = await request(app)
      .post(`/friends/requests/${userId}`)
      .send({ accept: true })
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN_ACCEPT_USER)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("Accepted");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/friends/requests/${userId}`)
      .send({ accept: true })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Reject friend request
describe("POST /friends/requests/:friendId", () => {
  it("should reject friend request", async () => {
    const res = await request(app)
      .post(`/friends/requests/${userId}`)
      .send({ accept: false })
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN_REJECT_USER)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("Rejected");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .post(`/friends/requests/${userId}`)
      .send({ accept: false })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get the current user's friends
describe("GET /friends/mutual/:userId", () => {
  it("should return list of friend requests", async () => {
    const res = await request(app)
      .get(`/friends/mutual/${mutualId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toEqual(expect.any(Array))
    if (res.body.length > 0) {
      expect(res.body[0]).toMatchObject({
        id: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        profileImage: expect.any(String)
      })
    }
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/friends/mutual/${mutualId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Unfriend
describe("DELETE /friends/:friendId", () => {
  it("should unfriend a user", async () => {
    const res = await request(app)
      .delete(`/friends/${acceptFriendId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .delete(`/friends/${acceptFriendId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});