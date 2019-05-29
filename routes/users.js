const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');

let Book = require('../models/book');
let User = require('../models/user');
let upload = require('../models/multer');

router.get('/profile/:name', function (req, res, next) {
    let me = req.user;
    if(req.user == null) {
        me = 'guest123456789';
    }
    let name = req.params.name;
    User.findOne({username : name}, function (err, user) {
        Book.find({}, function (err, books) {
            if (err) {
                console.log("ERROR: " + err)
            } else {
                res.render("profile", {books: books, me: me, user: user});
            }
        });
    });
});

router.get('/del', ensureAuthenticated, function (req, res, next) {
    User.find({}, function (err, users) {
        if (err) {
            console.log("ERROR: " + err)
        } else {
            res.render("users_delete", {users: users});
        }
    });
});

router.post('/del/:id', function (req, res) {

    if (!req.user._id) {
        res.status(500).send();
    }

    let query = {_id: req.params.id};

    User.findById(req.params.id, function (err, user) {
        if ('Handler' === req.user.level) {
            Book.deleteMany({reviewer: query}, function (err, book) {
                User.remove(query, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect('/discover');
                });
            });
        } else {
            res.status(500).send();
        }
    });
});

router.post('/register', function (req, res) {

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const img = fs.readFileSync('./206655-OZR5T6-881.jpg');
    const encode_image = img.toString('base64');

    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('passwordConf', 'Password is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        req.flash('danger', 'Something went wrong, try again');
        res.redirect('/discover');
    } else {
        let newUser = new User({
            email: email,
            username: username,
            password: password,
            point: 0,
            level: 'Reader',
            image: {
                filename: 'usercover326154276482391',
                data: new Buffer(encode_image, 'base64')
            }
        });

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        req.flash('success','You are registered');
                        res.redirect('/discover');
                    }
                });
            });
        });
    }
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/discover',
        failureRedirect: '/discover',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/discover');
});

router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        res.render('edit_profile', {
            user: user
        });
    });
});

router.post('/edit/:id', upload.single('image'), function (req, res) {

    let user = {};

    if (req.file) {
        user = {
            bio: req.body.bio,
            image: {}
        };
        let img = fs.readFileSync(req.file.path);
        let encode_image = img.toString('base64');
        user.image.filename = req.file.filename;
        user.image.data = new Buffer(encode_image, 'base64');
    } if (!req.file) {
        user = {
            bio: req.body.bio
        };
    }

    let query = {_id: req.params.id};

    User.update(query, user, function (err) {
        if (err) {
            console.log(err);
            return 0;
        } else {
            req.flash('success','Profile updated');
            res.redirect('/discover');
        }
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