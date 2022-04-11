const { bucket } = require('../config/multerConfig');
const { format } = require('util');

// Upload book file to Google Bucket
// If upload successful return file URL
const uploadBookImage = (file, userId, bookId) => new Promise((resolve, reject) => {
  const { originalname, buffer } = file

  const blob = bucket.file(`${userId}/books/${bookId}/${originalname}`)
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: { cacheControl: "public, max-age=0" }
  })
  blobStream.on('finish', () => {
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    )
    resolve(publicUrl)
  })
  .on('error', () => {
    reject(`Unable to upload image, something went wrong`)
  })
  .end(buffer)
})

// Upload profile image to Google Bucket
// If upload successful return file URL
const uploadProfileImage = (profileImage, userId) => new Promise((resolve, reject) => {
  const { originalname, buffer } = profileImage

  const blob = bucket.file(`${userId}/images/${originalname}`)
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: { cacheControl: "public, max-age=0" }
  })
  blobStream.on('finish', () => {
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    )
    console.log(publicUrl);
    resolve(publicUrl)
  })
    .on('error', () => {
      reject(`Unable to upload image, something went wrong`)
    })
    .end(buffer)
})

module.exports = { uploadBookImage, uploadProfileImage}