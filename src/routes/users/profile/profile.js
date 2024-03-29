// /users/profile
require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { uploadProfileMulter } = require('../../../config/multerConfig');
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');
const { uploadProfileImage } = require('../../../helpers/uploadImage');
const { authenticateToken } = require('../../../middlewares');
const path = require('path');

// Update information about the user
router.put('/edit', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { firstName, lastName, email, password } = req.body;

  try {

    // Check email already exists
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, user.id]);

    if (checkEmail.rows.length !== 0) {
      return res.status(400).json({ status: false, message: "Email already exists" });
    }

    // Update info
    if (password) {
      let hash = '';
      hash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4 WHERE id = $5;',
        [firstName, lastName, email, hash, user.id]
      );
    } else {
      await pool.query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4;',
        [firstName, lastName, email, user.id]
      );
    }

    return normalMsg(res, 200, true, 'OK')
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// Upload profile image
router.post('/edit/upload',
  authenticateToken,
  uploadProfileMulter,
  async (req, res, next) => {
    const user = req.user;
    const profileImage = req.file;

    try {
      // Add paths to db
      if (profileImage) {
        const toUpload = profileImage;
        toUpload.originalname = `profileImage${path.extname(profileImage.originalname)}`;
        
        const profileImageUrl = await uploadProfileImage(toUpload, user.id);

        await pool.query(
          'UPDATE users SET profile_image = $1 WHERE id = $2;',
          [profileImageUrl, user.id]
        )
      }
      return normalMsg(res, 200, true, "OK");
    } catch (err) {
      res.status(500);
      next(err)
    }
  }
);

module.exports = router;