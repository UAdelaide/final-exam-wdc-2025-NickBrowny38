var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require('./db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

(async () => {
    try {
        const connection = await db.getConnection();

        const [user_rows] = await db.query('SELECT COUNT(*) AS count FROM Users');
        if (user_rows[0].count === 0) {
            // Insert test users
            await connection.query(`
                INSERT INTO Users (username, email, password_hash, role)
                VALUES
                ('alice123', 'alice@example.com', 'hashed123', 'owner'),
                ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
                ('carol123', 'carol@example.com', 'hashed789', 'owner'),
                ('angelawalker', 'angela@example.com', 'hashed000', 'walker'),
                ('kim123', 'kim@example.com', 'hashed999', 'owner')
            `);
        }


        const [dog_rows] = await db.query('SELECT COUNT(*) AS count FROM Dogs');
        if (dog_rows[0].count === 0) {
            // Insert test dogs
            await connection.query(`
                INSERT INTO Dogs (owner_id, name, size)
                VALUES
                ((SELECT user_id FROM Users WHERE username = 'alice123'),
                'Max',
                'medium'),
                ((SELECT user_id FROM Users WHERE username = 'carol123'),
                'Bella',
                'small'),
                ((SELECT user_id FROM Users WHERE username = 'kim123'),
                'Benny',
                'large'),
                ((SELECT user_id FROM Users WHERE username = 'alice123'),
                'Lilly',
                'small'),
                ((SELECT user_id FROM Users WHERE username = 'carol123'),
                'Archie',
                'medium')
            `);
        }

        const [walk_req_rows] = await db.query('SELECT COUNT(*) AS count FROM WalkRequests');
        if (walk_req_rows[0].count === 0) {
            // Insert test walk requests
            await connection.query(`
                INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
                VALUES
                ((SELECT dog_id FROM Dogs WHERE name = 'Max'),
                '2025-06-10 08:00:00' ,
                30,
                'Parklands',
                'open'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Bella'),
                '2025-06-10 09:30:00',
                45,
                'Beachside Ave',
                'accepted'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Benny'),
                '2025-06-11 13:30:00',
                25,
                'Port Augusta',
                'cancelled'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Lilly'),
                '2025-06-11 07:00:00',
                30,
                'Botanic Gardens',
                'open'),
                ((SELECT dog_id FROM Dogs WHERE name = 'Archie'),
                '2025-06-11 11:15:00',
                60,
                'Eba Anchorage',
                'completed')
            `);
        }
    } catch (err) {
        console.error('Error setting up database', err);
    }
})();

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

// Route to return open walk requests
app.get('/api/walkrequests/open', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT wr.request_id,
            d.name AS dog_name,
            wr.requested_time,
            wr.duration_minutes,
            wr.location,
            u.username AS owner_username
            FROM WalkRequests wr
            INNER JOIN Dogs d ON wr.dog_id = d.dog_id
            INNER JOIN Users u ON d.owner_id = u.user_id
            WHERE wr.status = 'open'
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch open walk requests'});
    }
});

// Route to return walkers summary
app.get('/api/walkers/summary', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.username AS walker_username,
            COUNT(DISTINCT wrate.rating_id) AS num_ratings,
            AVG(wrate.rating) AS avg_ratings,
            COUNT(DISTINCT wapp.walker_id) AS num_walks
            FROM Users u
            LEFT JOIN WalkApplications wapp ON u.user_id = wapp.walker_id AND wapp.status = 'completed'
            LEFT JOIN WalkRatings wrate ON u.user_id = wrate.walker_id
            WHERE u.role = 'walker'
            GROUP BY u.user_id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch open walk requests'});
    }
});

module.exports = app;
