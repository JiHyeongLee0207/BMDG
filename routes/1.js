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
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    let selectedYear = req.query.year;
    console.log("받아온 쿼리 파라미터: ",selectedYear);

    var boxName = req.query.year;
    if(req.query.year === undefined)
        boxName = "연도선택";

    const css = `
    `;
    const search = `
    <form id="yearForm" method="get">
        <div class="dropdown">
            <button type="button" class="dropbtn" id="dropdownButton">${boxName}</button>
            <div id="myDropdown" class="dropdown-content">
                ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => 
                    `<a href="#" onclick="selectYear(event, ${year})">${year}</a>`
                ).join('')}
            </div>
        </div>
        <input type="hidden" name="year" id="selectedYear">
    </form>
    `;

    let year = selectedYear;
    year = parseInt(year);
    const data = await collection.aggregate([
        { $match: { 연도: year } },
        { $sort: { "물건금액(만원)": -1 } },
        { $limit: 1 },
        { $project: {
            "_id":0,
            "연도": 1,
            "건물명":1,
            "자치구명": 1,
            "법정동명": 1,
            "물건금액(만원)": 1,
            "건물면적(㎡)": 1,
            "층": 1,
            "건물용도": 1
        }}
    ]).toArray(); // 결과를 배열로 변환
    // console.log("받아온 쿼리 파라미터: ",data);
    
    // 결과를 HTML로 구성
    const contents = data.length > 0 ? `
    <h2>검색 결과</h2>
    <p>연도: ${data[0].연도}</p>
    <p>건물명: ${data[0].건물명}</p>
    <p>자치구명: ${data[0].자치구명}</p>
    <p>법정동명: ${data[0].법정동명}</p>
    <p>물건금액: ${data[0]["물건금액(만원)"]}만원</p>  
    <p>건물면적: ${data[0]["건물면적(㎡)"]}㎡</p>     
    <p>층: ${data[0].층}층</p>
    <p>건물용도: ${data[0].건물용도}</p>
    ` : '<p>결과가 없습니다.</p>';

    const func = `
    function selectYear(event, year) {
        event.preventDefault(); // 기본 링크 동작을 막음

        showLoadingScreen();
        
        // 선택된 연도를 hidden input에 설정
        document.getElementById('selectedYear').value = year;
        
        // 버튼 텍스트를 선택된 연도로 변경
        document.getElementById('dropdownButton').innerText = year;

        // URL 쿼리 문자열을 변경
        const url = new URL(window.location);
        url.searchParams.set('year', year);
        window.history.pushState({}, '', url);

        // 폼을 제출하여 페이지 갱신
        document.getElementById('yearForm').submit();
    }
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, func));
});

router.get('/2', (req, res, next) => {
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