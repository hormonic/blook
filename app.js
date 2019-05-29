const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

const PORT = process.env.PORT || 5000;

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function (err) {
    console.log(err);
});

// Init App
const app = express();

// Bring in Models
let Book = require('./models/book');
let User = require('./models/user');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(flash());

app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

app.get('/', function (req, res) {
    res.redirect('discover');
});

app.get('/discover', function (req, res) {
    Book.find({}, function (err, books) {
        User.find({}, function (err, users) {
            if (err) {
                console.log("ERROR: " + err)
            } else {
                res.render("discover", {books: books, users: users});
            }
        });
    });
});

app.get('/discover/mostviewed', function (req, res) {
    Book.find({}, null, {sort: {view: 1}}, function (err, books) {
        User.find({}, function (err, users) {
            if (err) {
                console.log("ERROR: " + err);
            } else {
                res.render("discover_most", {books: books, users: users});
            }
        });
    });
});

// Route Files
let books = require('./routes/books');
let users = require('./routes/users');
app.use('/books', books);
app.use('/users', users);

// Start Server
app.listen(PORT, function () {
    console.log('Server started on port 5000...');
});
