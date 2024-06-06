const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
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
    let purpose = req.query.purpose;
    let year = req.query.year;

    if (!Number.isInteger(parseInt(year))) {
        year = parseInt(year);
        console.log("Converted year to Number:", year);
    }
    console.log("받아온 쿼리 파라미터: ",purpose,year);

    const css = `
    <link rel="stylesheet" href="../css/submitbtn.css">
    `;
    const search = `
    <form id="yearForm" method="get">
        <div class="dropdown">
            <button type="button" class="dropbtn" id="purposeDropdownButton">용도</button>
            <div class="dropdown-content">
                ${["아파트", "오피스텔", "연립다세대", "단독다가구"].map(data => 
                    `<a href="#" onclick="handlePurposeSelect(event, '${data}')">${data}</a>`
                ).join('')}
            </div>
        </div>
        <div class="dropdown">
            <button type="button" class="dropbtn" id="yearDropdownButton">연도</button>
            <div class="dropdown-content">
                ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => 
                    `<a href="#" onclick="handleYearSelect(event, ${year})">${year}</a>`
                ).join('')}
            </div>
        </div>
        <div class="formsubmit" id="formSubmit" onclick="handleSubmit(event);" style="display:inline-block">
            <button type="button" class="submitbtn" id="nonformSubmit">조회</button>
        </div>
        <input type="hidden" name="purpose" id="purpose">
        <input type="hidden" name="year" id="year">
    </form>
    `;

    year = parseInt(year);

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
        <script src="../js/4.js"></script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
    });

router.get('/2', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    let purpose = req.query.purpose;
    let year = req.query.year;

    if (!Number.isInteger(parseInt(year))) {
        year = parseInt(year);
        console.log("Converted year to Number:", year);
    }
    console.log("받아온 쿼리 파라미터: ",purpose,year);

    const css = `
    <link rel="stylesheet" href="../css/submitbtn.css">
    `;
    const search = `
    <form id="yearForm" method="get">
        <div class="dropdown">
            <button type="button" class="dropbtn" id="purposeDropdownButton">용도</button>
            <div class="dropdown-content">
                ${["아파트", "오피스텔", "연립다세대", "단독다가구"].map(data => 
                    `<a href="#" onclick="handlePurposeSelect(event, '${data}')">${data}</a>`
                ).join('')}
            </div>
        </div>
        <div class="dropdown">
            <button type="button" class="dropbtn" id="yearDropdownButton">연도</button>
            <div class="dropdown-content">
                ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => 
                    `<a href="#" onclick="handleYearSelect(event, ${year})">${year}</a>`
                ).join('')}
            </div>
        </div>
        <div class="formsubmit" id="formSubmit" onclick="handleSubmit(event);" style="display:inline-block">
            <button type="button" class="submitbtn" id="nonformSubmit">조회</button>
        </div>
        <input type="hidden" name="purpose" id="purpose">
        <input type="hidden" name="year" id="year">
    </form>
    `;

    year = parseInt(year);

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
        <script src="../js/4.js"></script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
    });
module.exports = router;
