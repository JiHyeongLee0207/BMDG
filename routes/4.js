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


//최대거래량자치구 정보--------------------------------------------------------------
router.get('/1', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    let selectedYear = req.query.year;

    if (!Number.isInteger(parseInt(selectedYear))) {
        selectedYear = parseInt(selectedYear);
        console.log("Converted selectedYear to Number:", selectedYear); // 변환된 selectedYear 값 로깅
    }

    const css = `
    <link rel="stylesheet" href="../css/page.css">
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

    let year = selectedYear;
    year = parseInt(year);
    const purpose = "아파트";


  //8.거래가 가장 많이 발생하는 자치구 25개 역순 정렬
    const data1 = await collection.aggregate([
        { $match: { 연도: year, 건물용도: purpose } },
        { $group: { _id: "$자치구명", 거래량: { $sum: 1 } } },
        { $sort: { 거래량: -1 } },
        { $limit: 25 }
    ]).toArray(); // 결과를 배열로 변환
    console.log("받아온 쿼리 파라미터: ",data1);


    const contents = (data1.length > 0) ? `<div>
        <h2>거래가 가장 많이 발생하는 자치구 25개</h2>
        <table>
            <thead>
                <tr>
                    <th>자치구명</th>
                    <th>거래량</th>
                </tr>
            </thead>
            <tbody>
                ${data1.map(districtData => `
                    <tr>
                        <td>${districtData._id}</td>
                        <td>${districtData.거래량}건</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>` : '<div><p>결과가 없습니다.</p></div>';

    const js = `
    <script src="../js/1.js"></script>
`;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
    });
    

//최대 평균가격 자치구 정보--------------------------------------------------------------
router.get('/2', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    let selectedYear = req.query.year;

    if (!Number.isInteger(parseInt(selectedYear))) {
        selectedYear = parseInt(selectedYear);
        console.log("Converted selectedYear to Number:", selectedYear); // 변환된 selectedYear 값 로깅
    }

    const css = `
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

    let year = selectedYear;
    year = parseInt(year);
    const purpose = "아파트";



    //9.자치구별 가격평균값 역순 정렬
    const data1 = await collection.aggregate([
        { $match: { 연도: year, 건물용도: purpose } },
        { $group: { _id: "$자치구명", 평균가격: { $avg: "$물건금액(만원)" } } },
        { $sort: { 평균가격: -1 } }
    ]).toArray(); // 결과를 배열로 변환
    
    console.log("받아온 쿼리 파라미터: ",data1);


    // 결과가 있는지 확인 후 출력
    const contents = (data1.length > 0) ? `<div>
    <h2>자치구별 가격평균값 역순 정렬</h2>
    <table>
        <thead>
            <tr>
                <th>자치구명</th>
                <th>평균가격</th>
            </tr>
        </thead>
        <tbody>
            ${data1.map(districtData => `
                <tr>
                    <td>${districtData._id}</td>
                    <td>${formatKoreanCurrency(districtData.평균가격.toFixed(0))}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    </div>` : '<div><p>결과가 없습니다.</p></div>';

    const js = `
    <script src="../js/1.js"></script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
    });


//최대거래량 동 정보--------------------------------------------------------------
router.get('/3', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    let selectedYear = req.query.year;

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
    const purpose = "아파트";
    const jachigu = "강남구";

  //10. 거래가 가장 많이 발생하는 법정동 25개 역순 정렬
    const data1 = await collection.aggregate([
        { $match: { 연도: year, 건물용도: purpose, 자치구명: jachigu } },
        { $group: { _id: "$법정동명", 거래량: { $sum: 1 } } },
        { $sort: { 거래량: -1 } },
        { $limit: 25 }
    ]).toArray(); // 결과를 배열로 변환
    console.log("받아온 쿼리 파라미터: ",data1);


    const contents = (data1.length > 0) ? `<div>
    <h2> ${jachigu}에서 거래가 가장 많이 발생하는 법정동 목록</h2>
        <table>
            <thead>
                <tr>
                    <th>법정동명</th>
                    <th>거래량</th>
                </tr>
            </thead>
            <tbody>
                ${data1.map(districtData => `
                    <tr>
                        <td>${districtData._id}</td>
                        <td>${districtData.거래량}건</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>` : '<div><p>결과가 없습니다.</p></div>';
    
    const js = `
    <script src="../js/1.js"></script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
    });

//최대 평균가격 동 정보--------------------------------------------------------------
router.get('/4', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    let selectedYear = req.query.year;

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
    const purpose = "아파트";
    const jachigu = "강남구";
    
    

    //11.법정동별 가격평균값 역순 정렬
    const data1 = await collection.aggregate([
        { $match: { 연도: year, 건물용도: purpose,자치구명: jachigu } },
        { $group: { _id: "$법정동명", 평균가격: { $avg: "$물건금액(만원)" } } },
        { $sort: { 평균가격: -1 } }
    ]).toArray(); // 결과를 배열로 변환
    
    console.log("받아온 쿼리 파라미터: ",data1);


    // 결과가 있는지 확인 후 출력
    const contents = (data1.length > 0) ? `<div>
    <h2> ${jachigu}에서의 동별 평균가 목록</h2>
    <table>
        <thead>
            <tr>
                <th>자치구명</th>
                <th>평균가격</th>
            </tr>
        </thead>
        <tbody>
            ${data1.map(districtData => `
                <tr>
                    <td>${districtData._id}</td>
                    <td>${formatKoreanCurrency(districtData.평균가격.toFixed(0))}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    </div>` : '<div><p>결과가 없습니다.</p></div>';

    
    const js = `
    <script src="../js/1.js"></script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
    });

module.exports = router;

function formatKoreanCurrency(value) {
    let result = '';
    if (value >= 10000) {
        const eok = Math.floor(value / 10000);
        const man = value % 10000;
        result = `${eok}억`;
        if (man > 0) {
            result += ` ${man}만원`;
        }
    } else {
        result = `${value}만원`;
    }
    return result;
}
