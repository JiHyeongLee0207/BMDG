const express = require('express');
const router = express.Router();
const fs = require('fs');
var template = require('../public/html/template.js');

router.get('/', (req, res, next) => {
    console.log('hi');
    res.send(template);

});

router.get('/', (req, res, next) => {
    console.log('hi');
    res.send(template);

});

module.exports = router;
