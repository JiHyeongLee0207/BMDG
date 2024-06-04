const express = require('express');
const router = express.Router();
const fs = require('fs');
var template = require('../public/html/template.js');

router.get('/', (req, res, next) => {
    console.log('hi');
    const css = `
        <link rel="stylesheet" href="../css/main.css">
    `;
    const search = `
        <p style="text-align:center">This is BMDG</p>
    `;
    const contents = `
        
    `
    res.send(template.make_page(css,search,contents));
});

module.exports = router;