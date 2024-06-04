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
    res.send(template);

});
router.get('/2', (req, res, next) => {
    console.log('hi');
    res.send(template);

});
router.get('/3', (req, res, next) => {
    console.log('hi');
    res.send(template);

});
router.get('/4', (req, res, next) => {
    console.log('hi');
    res.send(template);

});


module.exports = router;
