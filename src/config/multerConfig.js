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


const bucket = uploadBookStorage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

module.exports = { uploadBookMulter, bucket }