const multer = require("multer");
const {Storage} = require('@google-cloud/storage'); 

// Bucket config
const storage = new Storage();
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

// The origin for this CORS config to allow requests from
const localOrigin = process.env.CORS_ORIGIN_LOCAL;
const remoteOrigin = process.env.CORS_ORIGIN_REMOTE;

// CORS config
const responseHeader = 'Content-Type';
const maxAgeSeconds = 3600;
const method = 'GET';

(async () => {
  await configureBucketCors();
})();

async function configureBucketCors() {
  await storage.bucket(process.env.GCLOUD_STORAGE_BUCKET).setCorsConfiguration([
    {
      maxAgeSeconds,
      method: [method],
      origin: [localOrigin, remoteOrigin],
      responseHeader: [responseHeader],
    },
  ]);
}

// Upload book (file and cover)
const uploadBookMulter = multer({
  storage: multer.memoryStorage()
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]); 

// Delete book (file and cover)
const deleteBook = async (userId, bookId) => {
  const folderName = `${userId}%2Fbooks%2F${bookId}`;

  const files = await bucket.getFiles();
  const folderFiles = files[0].filter(f => f.id.includes(folderName + "%2F"));

  folderFiles.forEach(async file => {
    try {
      await file.delete();
    } catch (err) {
      throw err
    }
  }) 
}


// Upload user profile image
const uploadProfileMulter = multer({
  storage: multer.memoryStorage()
}).single('profileImage'); 

const deleteProfile = async (userId) => {
  const folderName = `${userId}%2Fimages%2F`;

  const files = await bucket.getFiles();
  const folderFiles = files[0].filter(f => f.id.includes(folderName + "%2F"));

  folderFiles.forEach(async file => {
    try {
      await file.delete();
    } catch (err) {
      throw err
    }
  })
}

module.exports = { 
  uploadBookMulter, 
  uploadProfileMulter, 
  bucket, 
  deleteBook, 
  deleteProfile 
}