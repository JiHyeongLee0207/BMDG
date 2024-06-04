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

router.get('/1', async (req, res, next) => {
    const selectedYear = req.query.year;
    
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    const query = await collection.findOne();

    const css = `
    <link rel="stylesheet" href="../css/main.css">
    `;
    const search = `
    <form id="yearForm" method="get">
        <div class="dropdown">
            <button type="button" class="dropbtn" id="dropdownButton">연도선택</button>
            <div id="myDropdown" class="dropdown-content">
                ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => 
                    `<a href="#" onclick="selectYear(event, ${year})">${year}</a>`
                ).join('')}
            </div>
        </div>
        <input type="hidden" name="year" id="selectedYear">
    </form>
    `;

    
    const contents = selectedYear !== undefined ? `


    
    ` : '';
    const func = `
    function selectYear(event, year) {
        event.preventDefault(); // 기본 링크 동작을 막음
        
        // 선택된 연도를 hidden input에 설정
        document.getElementById('selectedYear').value = year;
        
        // 버튼 텍스트를 선택된 연도로 변경
        document.getElementById('dropdownButton').innerText = year;

        // URL 쿼리 문자열을 변경
        const url = new URL(window.location);
        url.searchParams.set('year', year);
        window.history.pushState({}, '', url);
    }
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, func));
});

router.get('/2', async (req, res, next) => {
    const selectedYear = req.query.year;
    
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // 가장 높은 input_no 값을 가져와서 다음 값을 설정
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    const query = await collection.findOne();

    const css = `
    <link rel="stylesheet" href="../css/main.css">
    `;
    const search = `
    <form id="yearForm" method="get">
        <select name="year" id="year">
            <option value="" ${!selectedYear ? 'selected' : ''} disabled class="hidden">연도선택</option>
            ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => 
                `<option value="${year}" ${selectedYear == year ? 'selected' : ''}>${year}</option>`
            ).join('')}
        </select>   
    </form>
    `;
    const contents = selectedYear !== undefined ? `
        



    ` : '';
    const func = `
    document.getElementById('year').addEventListener('change', function() {
        document.getElementById('yearForm').submit();
    });
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, func));
});

module.exports = router;