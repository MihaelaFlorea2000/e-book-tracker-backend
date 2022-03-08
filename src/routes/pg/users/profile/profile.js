// /pg/users/profile
require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { pool } = require('../../../../config/postgresConfig');
const { normalMsg } = require('../../../../helpers/returnMsg');
const { authenticateToken } = require('../../../../middlewares');

// Update information about the user
router.put('/edit', authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { id, firstName, lastName, email, password } = req.body;

  try {
    // Check user is changing his own info
    if (id !== user.id) {
      return res.status(401).json({ status: false, meessage: "Unauthorised" });
    }

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
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4, profile_image = $5 WHERE id = $6;',
        [firstName, lastName, email, hash, profileImage, user.id]
      );
    } else {
      await pool.query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $5;',
        [firstName, lastName, email, user.id]
      );
    }

    return normalMsg(res, 200, true, 'OK')
  } catch (err) {
    res.status(500);
    next(err);
  }
});

module.exports = router;