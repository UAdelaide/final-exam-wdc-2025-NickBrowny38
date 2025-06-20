var express = require('express');
var router = express.Router();
const db = require('../models/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', async (req, res) => {
  var name = req.body.username;
  var pass = req.body.password;

  try {
    const [rows] = await db.query(
      "SELECT * FROM Users WHERE username = ? AND password = ?",
      [name, pass]
    );

    if (rows.length !== 0) {
      const user = rows[0];
      req.session.user = {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      };
      res.redirect('/public/owner-dashboard.html');
    } else {
        res.status(401).json({ message: 'Invalid credentials'});
    }
  } catch (err) {
    res.status(500).json({ message: 'Login Error'});
  }
});

module.exports = router;
