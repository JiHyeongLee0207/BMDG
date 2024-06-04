const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
var template = require('../public/html/template.js');
const { MongoClient } = require("mongodb");
const {
  connectDB,
  connectBMDG,
  closeConnection,
} = require("../db.js");

router.get('/1', (req, res, next) => {
    console.log('hi');
    fs.readFile('./public/html/5_1.html', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.send(data);
    });
});

router.get('/2', (req, res, next) => {
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
