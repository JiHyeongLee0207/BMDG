const express = require('express');
const router = express.Router();
const fs = require('fs');
var template = require('../public/html/template.js');

router.get('/1', (req, res, next) => {
    console.log('hi');
    const css = `
        <link rel="stylesheet" href="../css/main.css">
    `;
    const search = `
        
    `;
    const contents = `
        <div class="site">
            <h1>What is this site</h1>
            <p>This site is BMDG</p>
        </div>
        <div class="team">
            <h1>Team members</h1>
            <div class="team-inner">
                <div>
                    <img src="../images/chan.jpg" alt="">
                    <h3>Chan Lee</h3>
                </div>
                <div>
                    <img src="../images/jihyeong.jpg" alt="">
                    <h3>Jihyeong Lee</h3>
                </div>
            </div>
        </div>
    `
    res.send(template.make_page(css,"hi",contents));

});

router.get('/2', (req, res, next) => {
    console.log('hi');
    const css = `
        <link rel="stylesheet" href="../css/main.css">
    `;
    const search = `
        
    `;
    const contents = `
        <div class="site">
            <h1>What is this site</h1>
            <p>This site is BMDG</p>
        </div>
        <div class="team">
            <h1>Team members</h1>
            <div class="team-inner">
                <div>
                    <img src="../images/chan.jpg" alt="">
                    <h3>Chan Lee</h3>
                </div>
                <div>
                    <img src="../images/jihyeong.jpg" alt="">
                    <h3>Jihyeong Lee</h3>
                </div>
            </div>
        </div>
    `
    res.send(template.make_page(css,"hi",contents));
});

module.exports = router;