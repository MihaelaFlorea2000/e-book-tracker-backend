const { bucket } = require('../config/multerConfig');
const { format } = require('util');

const uploadImage = (file, userId, bookId) => new Promise((resolve, reject) => {
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

module.exports = {uploadImage}