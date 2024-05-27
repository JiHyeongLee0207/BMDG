const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', (req, res, next) => {
    console.log('hi');
    fs.readFile('./public/html/main.html', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.send(data);
    });
});

router.get('/page',(req,res)=>{
    fs.readFile('./public/html/page.html', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.send(data);
    });
});

module.exports = router;