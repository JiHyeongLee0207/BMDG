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

//가장 비싼/싼 건물--------------------------------------------------------------
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
                ${[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006].map(year => 
                    `<a href="#" onclick="selectYear(event, ${year})">${year}</a>`
                ).join('')}
            </div>
        </div>
        <input type="hidden" name="year" id="selectedYear">
    </form>
    `;

    let year = selectedYear;
    year = parseInt(year);

    //1.연도를 입력받아 서울시에서 거래된 가장 비싼 건물의 정보 추출:
    const data1 = await collection.aggregate([
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
    //console.log("받아온 쿼리 파라미터: ",data1);


    //2.연도를 입력받아 서울시에서 거래된 가장 싼 건물의 정보 추출:
    const data2 = await collection.aggregate([
        { $match: { 연도: year } },
        { $sort: { "물건금액(만원)": 1 } },
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
    console.log("받아온 쿼리 파라미터: ",data2);


    const contents = (data1.length > 0 || data2.length > 0) ? `<div>
    <h2>최대 물건금액 검색 결과</h2>
    ${data1.length > 0 ? `<div>
        <p>연도: ${data1[0].연도}</p>
        <p>건물명: ${data1[0].건물명}</p>
        <p>자치구명: ${data1[0].자치구명}</p>
        <p>법정동명: ${data1[0].법정동명}</p>
        <p>물건금액: ${template.formatKoreanCurrency(data1[0]["물건금액(만원)"])}</p>
        <p>건물면적: ${data1[0]["건물면적(㎡)"]}m^2</p>
        <p>층: ${data1[0].층}층</p>
        <p>건물용도: ${data1[0].건물용도}</p>
    </div>` : '<p>결과가 없습니다.</p>'}

    <h2>최소 물건금액 검색 결과</h2>
    ${data2.length > 0 ? `<div>
        <p>연도: ${data2[0].연도}</p>
        <p>건물명: ${data2[0].건물명}</p>
        <p>자치구명: ${data2[0].자치구명}</p>
        <p>법정동명: ${data2[0].법정동명}</p>
        <p>물건금액: ${template.formatKoreanCurrency(data2[0]["물건금액(만원)"])}</p>
        <p>건물면적: ${data2[0]["건물면적(㎡)"]}m^2</p>
        <p>층: ${data2[0].층}층</p>
        <p>건물용도: ${data2[0].건물용도}</p>
    </div>` : '<p>결과가 없습니다.</p>'}
    </div>` : '<div><p>결과가 없습니다.</p></div>';

console.log(contents);
    


    const js = `
    <script src="../js/13.js"></script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});


//면적대비 가장 비싼/싼 건물--------------------------------------------------------------
router.get('/2',async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    let selectedYear = req.query.year;
    console.log("받아온 쿼리 파라미터: ",selectedYear);
    if (!Number.isInteger(parseInt(selectedYear))) {
        selectedYear = parseInt(selectedYear);
        console.log("Converted selectedYear to Number:", selectedYear); // 변환된 selectedYear 값 로깅
    }

    const css = `
    <link rel="stylesheet" href="../css/main.css">
    `;
    const search = `
    <form id="yearForm" method="get">
        <div class="dropdown">
            <button type="button" class="dropbtn" id="dropdownButton">연도선택</button>
            <div id="myDropdown" class="dropdown-content">
                ${[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006].map(year => 
                    `<a href="#" onclick="selectYear(event, ${year})">${year}</a>`
                ).join('')}
            </div>
        </div>
        <input type="hidden" name="year" id="selectedYear">
    </form>
    `;

    let year = selectedYear;
    year = parseInt(year);

    //연도를 입력받아 면적대비 가격이 싼 건물 5개의 정보 추출:
    const data1 = await collection.aggregate([
        { $match: { 연도: year } },
        { $addFields: { "가격대비면적": { $divide: ["$물건금액(만원)", "$건물면적(㎡)"] } } },
        { $sort: { "가격대비면적": -1 } },
        { $limit: 5 },
        { $project: {
            "_id":0,
            "연도": 1,
            "건물명":1,
            "자치구명": 1,
            "법정동명": 1,
            "가격대비면적": 1,
            "층": 1,
            "건물용도": 1
        }}
    ]).toArray(); // 결과를 배열로 변환
    console.log("받아온 쿼리 파라미터: ",data1);

    const data2 = await collection.aggregate([
        { $match: { 연도: year } },
        { $addFields: { "가격대비면적": { $divide: ["$물건금액(만원)", "$건물면적(㎡)"] } } },
        { $sort: { "가격대비면적": 1 } },
        { $limit: 5 },
        { $project: {
            "_id":0,
            "연도": 1,
            "건물명":1,
            "자치구명": 1,
            "법정동명": 1,
            "가격대비면적": 1,
            "층": 1,
            "건물용도": 1
        }}
    ]).toArray(); // 결과를 배열로 변환
    console.log("받아온 쿼리 파라미터: ",data2);

    // 결과를 HTML로 구성
    const contents = (data1.length > 0 || data2.length > 0) ? `<div>
    <h2>가격대비 면적이 비싼 건물 검색 결과</h2>
    ${data1.length > 0 ? data1.map(building => `
        <div>
            <p>연도: ${building.연도}</p>
            <p>건물명: ${building.건물명}</p>
            <p>자치구명: ${building.자치구명}</p>
            <p>법정동명: ${building.법정동명}</p>
            <p>가격대비면적: ${building.가격대비면적 ? building.가격대비면적.toFixed(2) : '정보 없음'}</p>
            <p>층: ${building.층}층</p>
            <p>건물용도: ${building.건물용도}</p>
        </div>
    `).join('') : '<p>결과가 없습니다.</p>'}

    <h2>가격대비 면적이 저렴한 건물 검색 결과</h2>
    ${data2.length > 0 ? data2.map(building => `
        <div>
            <p>연도: ${building.연도}</p>
            <p>건물명: ${building.건물명}</p>
            <p>자치구명: ${building.자치구명}</p>
            <p>법정동명: ${building.법정동명}</p>
            <p>가격대비면적: ${building.가격대비면적 ? building.가격대비면적.toFixed(2) : '정보 없음'}</p>
            <p>층: ${building.층}층</p>
            <p>건물용도: ${building.건물용도}</p>
        </div>
    `).join('') : '<p>결과가 없습니다.</p>'}
    </div>` : '<div><p>결과가 없습니다.</p></div>';

    console.log(contents);
    
    
    const js = `
    <script src="../js/13.js"></script>
    `;
    
    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});

module.exports = router;