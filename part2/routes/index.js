var express = require('express');
var router = express.Router();
const db = require('../models/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Login route
router.post('/login', async (req, res) => {
  // Get details
  var name = req.body.username;
  var pass = req.body.password;

  try {
    const [rows] = await db.query(
      "SELECT * FROM Users WHERE username = ? AND password_hash = ?",
      [name, pass]
    );

    // Check if login details are valid
    if (rows.length !== 0) {
      const user = rows[0];
      req.session.user = {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      };

      // Redirect to owner/walker page respectively
      if (user.role === 'owner') {
        res.redirect('/owner-dashboard.html');
      } else if (user.role === 'walker') {
        res.redirect('/walker-dashboard.html');
      } else {
        res.status(403).json({ message: 'Invalid user role' });
      }
    } else {
        res.status(401).json({ message: 'Invalid credentials'});
    }
  } catch (err) {
    console.error('Login failed:',err);
    res.status(500).json({ message: 'Login Error' });
  }
});

router.post('/logout', function(req, res, next) {
  delete req.session.user;
  res.redirect('/index.html');
});

module.exports = router;
