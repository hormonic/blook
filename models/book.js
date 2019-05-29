let mongoose = require('mongoose');

// Article Schema
let bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    view: {
        type: Number
    },
    reviewer: {
        type: String
    },
    genre: {
        type: String,
        required: true
    },
    created: {
        type: Date, default: Date.now
    },
    image: {
        filename: {
            type: String
        },
        data: Buffer,
        contentType: String
    }
});

bookSchema.index({
    title: 'text',
    author: 'text',
    reviewer: 'text',
    genre: 'text',
}, {
    weights: {
        title: 5,
        genre: 3,
        author: 2,
        reviewer: 1
    },
});

let Book = module.exports = mongoose.model('Book', bookSchema);
