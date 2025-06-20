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

async function insertTestData() {
    try {
        const connection = await db.createConnection();

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
                '2025-06-10 08:00:00',
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
}

// Route to return Dogs
app.get('/api/dogs', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT name,
            size,
            (SELECT username FROM Users WHERE user_id = owner_id)
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
            SELECT request_id,
            (SELECT name FROM Dogs WHERE dog_id = dog_id),
            request_time,
            duration_minutes,
            location,
            
            FROM WalkRequests WHERE status = 'open'
            `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch open walk requests'});
    }
});

// Route to return walkers summary
app.get('/api/walkers/summary', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM WalkRequests WHERE status = 'open'");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch open walk requests'});
    }
});

module.exports = app;
