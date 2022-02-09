const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {Storage} = require('@google-cloud/storage'); 

// Upload Book
const uploadBookStorage = new Storage({
  projectId: 'comp3200',
  credentials: process.env.NODE_ENV === 'development' ? process.env.GOOGLE_APPLICATION_CREDENTIALS : process.env.GOOGLE_CREDENTIALS
});
const uploadBookMulter = multer({
  storage: multer.memoryStorage()
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]); 


const bucket = uploadBookStorage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

module.exports = { uploadBookMulter, bucket }