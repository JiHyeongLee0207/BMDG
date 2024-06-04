const express = require('express');
const router = express.Router();
const fs = require('fs');
var template = require('../public/html/template.js');

router.get('/', (req, res, next) => {
    console.log('hi');
    fs.readFile('./public/html/5_1.html', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.send(data);
    });
});

router.get('/', (req, res, next) => {
    console.log('hi');
    fs.readFile('./public/html/5_2.html', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.send(data);
    });
});

module.exports = router;
