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

    // 가장 높은 input_no 값을 가져와서 다음 값을 설정
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    

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

    const data = await collection.aggregate([
        { $match: { 연도: selectedYear } }, // 사용자가 입력한 연도와 일치하는 문서 찾기
        { $sort: { 물건금액: -1 } }, // 물건금액 기준으로 내림차순 정렬
        { $limit: 1 }, // 가장 위에 있는 문서만 선택
        { $project: { // 결과에 포함할 필드 지정
            "연도": 1,
            "자치구명": 1,
            "법정동명": 1,
            "물건금액": 1,
            "건물면적": 1,
            "층": 1,
            "건물용도": 1
        }}
    ]).toArray(); // 결과를 배열로 변환
    
    // 결과를 HTML로 구성
    const contents = queryResult.length > 0 ? `
    <h2>검색 결과</h2>
    <p>연도: ${queryResult[0].연도}</p>
    <p>자치구명: ${queryResult[0].자치구명}</p>
    <p>법정동명: ${queryResult[0].법정동명}</p>
    <p>물건금액: ${queryResult[0].물건금액}</p>
    <p>건물면적: ${queryResult[0].건물면적}</p>
    <p>층: ${queryResult[0].층}</p>
    <p>건물용도: ${queryResult[0].건물용도}</p>
` : '<p>결과가 없습니다.</p>';


    const func = `
    document.getElementById('year').addEventListener('change', function() {
        document.getElementById('yearForm').submit();
    });
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