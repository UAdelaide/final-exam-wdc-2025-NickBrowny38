/* eslint-disable linebreak-style */
const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const app = express();

//app.use(logger('dev'));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());

app.use(
    session({
        secret: 'some-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false
        }
    })
);

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const indexRouter = require('./routes/index');


app.use('/', indexRouter);
app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Route to return Dogs
app.get('/api/dogs', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT name AS dog_name,
            size AS size,
            (SELECT username FROM Users WHERE user_id = owner_id) AS owner_username
            FROM Dogs
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dogs'});
    }
});


// Export the app instead of listening here
module.exports = app;
