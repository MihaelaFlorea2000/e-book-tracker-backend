const multer = require("multer");
const {Storage} = require('@google-cloud/storage'); 

// Upload Book
const uploadBookStorage = new Storage();
const uploadBookMulter = multer({
  storage: multer.memoryStorage()
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]); 

// The origin for this CORS config to allow requests from
const localOrigin = process.env.CORS_ORIGIN_LOCAL;
const remoteOrigin = process.env.CORS_ORIGIN_REMOTE;

// The response header to share across origins
const responseHeader = 'Content-Type';

// The maximum amount of time the browser can make requests before it must
// repeat preflighted requests
const maxAgeSeconds = 3600;

// The name of the method
const method = 'GET';

(async () => {
  await configureBucketCors();
})();
const bucket = uploadBookStorage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

async function configureBucketCors() {
  await uploadBookStorage.bucket(process.env.GCLOUD_STORAGE_BUCKET).setCorsConfiguration([
    {
      maxAgeSeconds,
      method: [method],
      origin: [localOrigin, remoteOrigin],
      responseHeader: [responseHeader],
    },
  ]);

  console.log('Bucket was updated with a CORS config');
}

module.exports = { uploadBookMulter, bucket }