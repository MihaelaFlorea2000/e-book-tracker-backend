const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload Book
const uploadBookStorage =  multer.diskStorage({
  destination: (req, file, cb) => {
    const path = `./uploads/${req.user.id}/books/${req.params.bookId}`
    fs.mkdirSync(path, {recursive: true})
    return cb(null, path);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const name = `${file.fieldname}${extension}`
    cb(null, name)
  }
});

const uploadBookMulter = multer({storage: uploadBookStorage}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

module.exports = { uploadBookMulter }