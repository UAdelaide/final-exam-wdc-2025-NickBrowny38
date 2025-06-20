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

        // Insert test users
        await connection.query(`
            INSERT INTO Users (username, email, password_hash, role)
            VALUES
            ('alice123', 'alice@example.com', 'hashed123', 'owner'),
            ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
            ('carol123', 'carol@example.com', 'hashed789', 'owner'),
            ('angelawalker', 'angela@example.com', 'hashed000', 'walker'),
            ('kim123', 'kim@example.com', 'hashed999', 'owner');
        `);

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
            'medium');
        `);

        // Insert test walk requests
        await connection.query(`

        `);
    }
}



module.exports = app;
