require('dotenv').config();
const request = require('supertest');
const app = require("../src/app");
const { 
  editProfile, 
  editAppearanceSettings, 
  editPrivacySettings 
} = require("../src/helpers/testExamples");

let userId = 11

// Get the user settings
describe("GET /users/settings", () => {
  it("should return settings object", async () => {
    const res = await request(app)
      .get("/users/settings")
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      darkTheme: expect.any(Boolean),
      fontSize: expect.any(Number),
      readerTheme: expect.any(String),
      notifications: expect.any(Boolean),
      profileVisibility: expect.any(String),
      showGoals: expect.any(Boolean),
      showBooks: expect.any(Boolean),
      showNumbers: expect.any(Boolean),
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get("/users/settings")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Get the user profile preferences
describe("GET /users/settings/profile/:userId", () => {
  it("should return profile preferences object", async () => {
    const res = await request(app)
      .get(`/users/settings/profile/${userId}`)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body).toMatchObject({
      profileVisibility: expect.any(String),
      showGoals: expect.any(Boolean),
      showBooks: expect.any(Boolean),
      showNumbers: expect.any(Boolean),
    })
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .get(`/users/settings/profile/${userId}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Edit profile settings
describe("PUT /users/profile/edit", () => {
  it("should update profile details", async () => {
    const res = await request(app)
      .put("/users/profile/edit")
      .send(editProfile)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .put("/users/profile/edit")
      .send(editProfile)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Upload profile image to bucket
describe("POST /users/profile/edit/upload", () => {
  it("should return unauthorised", async () => {
    const res = await request(app)
      .post("/users/profile/edit/upload")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Edit appearance settings
describe("PUT /users/settings/appearance", () => {
  it("should update appearance settings", async () => {
    const res = await request(app)
      .put("/users/settings/appearance")
      .send(editAppearanceSettings)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .put("/users/settings/appearance")
      .send(editAppearanceSettings)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});

// Edit privacy settings
describe("PUT /users/settings/privacy", () => {
  it("should update privacy settings", async () => {
    const res = await request(app)
      .put("/users/settings/privacy")
      .send(editPrivacySettings)
      .set("Accept", "application/json")
      .set("Authorization", process.env.TEST_TOKEN)
      .expect("Content-Type", /json/)
      .expect(200)

    expect(res.body.status).toEqual(true);
    expect(res.body.message).toEqual("OK");
  });

  it("should return unauthorised", async () => {
    const res = await request(app)
      .put("/users/settings/privacy")
      .send(editPrivacySettings)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403)

    expect(res.body.status).toEqual(false);
    expect(res.body.message).toEqual("Unauthorised");
  });
});