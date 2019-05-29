const express = require('express');
const router = express.Router();
const fs = require('fs');

let Book = require('../models/book');
let User = require('../models/user');
let upload = require('../models/multer');

router.get('/publish', ensureAuthenticated, function (req, res) {
    res.render('publish');
});

router.get('/genre/:name', function (req, res) {
    let name = req.params.name;
    Book.find({}, function (err, books) {
        User.find({}, function (err, users) {
            if (err) {
                console.log("ERROR: " + err);
            } else {
                res.render("discover_genre", {books: books, users: users, name: name});
            }
        });
    });
});

router.post('/create', upload.single('image'), function (req, res) {

    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();
    req.checkBody('genre', 'Genre is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        req.flash('danger', 'Something went wrong, try again');
        res.redirect('/publish');
    } else {
        let book = new Book();
        book.title = req.body.title;
        book.reviewer = req.user._id;
        book.author = req.body.author;
        book.body = req.body.body;
        book.genre = req.body.genre;
        book.view = 0;

        if (req.file) {
            let img = fs.readFileSync(req.file.path);
            let encode_image = img.toString('base64');
            book.image.filename = req.file.filename;
            book.image.data = new Buffer(encode_image, 'base64');
        } else if (!req.file) {
            let img = fs.readFileSync('./296266-P749CB-275.jpg');
            let encode_image = img.toString('base64');
            book.image.filename = 'bookcover437659821546731';
            book.image.data = new Buffer(encode_image, 'base64');
        }

        book.save(function (err) {
            if (err) {
                console.log(err);
                return 0;
            } else {
                req.flash('success', 'Book Created');
                res.redirect('/books/' + book._id);
            }
        });
    }
});

router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    Book.findById(req.params.id, function (err, book) {
        if (book.reviewer == req.user._id) {
            res.render('edit_book', {
                book: book
            });
        } else if ('Handler' === req.user.level) {
            res.render('edit_book', {
                book: book
            });
        } else {
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
    });
});

router.post('/edit/:id', upload.single('image'), function (req, res) {
    let book = {};

    if (req.file) {
        book = {
            title: req.body.title,
            author: req.body.author,
            body: req.body.body,
            genre: req.body.genre,
            image: {}
        };

        let img = fs.readFileSync(req.file.path);
        let encode_image = img.toString('base64');
        newbook.image.filename = req.file.filename;
        newbook.image.data = new Buffer(encode_image, 'base64');

    } else if (!req.file) {
        book = {
            title: req.body.title,
            author: req.body.author,
            body: req.body.body,
            genre: req.body.genre
        };
    }

    let query = {_id: req.params.id};

    Book.update(query, book, function (err) {
        if (err) {
            console.log(err);
            return 0;
        } else {
            req.flash('success','Book edited');
            res.redirect('/discover');
        }
    });
});

router.post('/delete/:id', function (req, res) {

    let query = {_id: req.params.id};

    Book.findById(req.params.id, function (err, book) {
        if (book.reviewer == req.user._id) {
            Book.remove(query, function (err) {
                if (err) {
                    console.log(err);
                }
                res.redirect('/discover');
            });
        } else if ('Handler' === req.user.level) {
            Book.remove(query, function (err) {
                if (err) {
                    console.log(err);
                }
                res.redirect('/discover');
            });
        } else {
            res.status(500).send();
        }
    });
});

router.get('/:id', function (req, res) {
    Book.findById(req.params.id, function (err, book) {
        User.findById(book.reviewer, function (err, user) {
            Book.update({_id: req.params.id}, {$inc: {view: true}}, {}, (err, numberAffected) => {
                res.render('show', {
                    book: book,
                    reviewer: user.username,
                });
            });
        });
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/discover');
    }
}

module.exports = router;