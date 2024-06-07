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


//용도별 연별 평균가격--------------------------------------------------------------
    router.get('/1', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    
    let purpose = req.query.purpose;
    let fromYear = req.query.fromYear;
    let toYear = req.query.toYear;
    
    console.log("받아온 쿼리 파라미터: ",fromYear,toYear,purpose);
    
    var purposeBoxName = req.query.purpose;
    var fromYearBoxName = req.query.fromYear;
    var toYearBoxName = req.query.toYear;
    if(req.query.purpose === undefined)
        purposeBoxName = "용도선택";
    if(req.query.fromYear === undefined)
        fromYearBoxName = "연도선택";
    if(req.query.toYear === undefined)
        toYearBoxName = "연도선택";
    
    const css = `
    <link rel="stylesheet" href="../css/submitbtn.css">
    `;
    const search = `
    <form id="yearForm" method="get">
    <div class="dropdown">
        <button type="button" class="dropbtn" id="purposeDropdownButton">${purposeBoxName}</button>
        <div class="dropdown-content">
            ${["아파트", "오피스텔", "연립다세대", "단독다가구"].map(data => 
                `<a href="#" onclick="handlePurposeSelect(event, '${data}')">${data}</a>`
            ).join('')}
        </div>
    </div>
    <div class="dropdown">
        <button type="button" class="dropbtn" id="fromYearDropdownButton">${fromYearBoxName}</button>
        <div class="dropdown-content">
            ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(data => 
                `<a href="#" onclick="handleFromYearSelect(event, ${data})">${data}</a>`
            ).join('')}
        </div>
    </div>
    &nbsp;~&nbsp;
    <div class="dropdown" id="toYearDropdown">
        <button type="button" class="dropbtn" id="toYearDropdownButton">${toYearBoxName}</button>
        <div class="dropdown-content" id="toYearDropdownContent">
            <!-- 종료 연도 옵션은 JavaScript를 통해 동적으로 생성됩니다 -->
        </div>
    </div>
    <div class="formsubmit" id="formSubmit" onclick="handleSubmit(event,'${purposeBoxName}','${fromYearBoxName}','${toYearBoxName}');" style="display:inline-block">
        <button type="button" class="submitbtn" id="nonformSubmit">조회</button>
    </div>
    <input type="hidden" name="purpose" id="purpose">
    <input type="hidden" name="fromYear" id="fromYear">
    <input type="hidden" name="toYear" id="toYear">
    </form>
    `;  


    let year1 = fromYear;
    year1 = parseInt(year1);
    let year2 = toYear;
    year2 = parseInt(year2);
    
    //5. 용도별 연간 평균 가격
    const data = await collection.aggregate([
        { $match: {
            연도: { $gte: year1, $lte: year2 },
        }},
        { $group: {
            _id: { 연도: "$연도", 건물용도: "$건물용도" },
            평균거래가격: { $avg: "$물건금액(만원)" }
        }},
        { 
            $sort: { "_id.건물용도": 1, "_id.연도": 1 }
        }
    ]).toArray(); // 결과를 배열로 변환

    // int로 변환
    data.forEach(building => {
        building.평균거래가격 = parseInt(building.평균거래가격);
    });

    console.log("받아온 쿼리 파라미터data: ", data);

    // 결과가 있는지 확인 후 출력
    const contents = (data.length > 0) ? `
        <div id="plotly-chart"></div>
        <div>
            <h2>용도별 연간 평균 거래 가격</h2>
            <table>
                <thead>
                    <tr>
                        <th>연도</th>
                        <th>건물 용도</th>
                        <th>평균 거래 가격</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(entry => `
                        <tr>
                            <td>${entry._id.연도}</td>
                            <td>${entry._id.건물용도}</td>
                            <td>${template.formatKoreanCurrency(entry.평균거래가격.toFixed(0))}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>` : '<div><p>결과가 없습니다.</p></div>';

    const js = `
    <script src="../js/2.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const data = ${JSON.stringify(data)};
            const traceData = [];
            const years = [...new Set(data.map(entry => entry._id.연도))];
            const purposes = [...new Set(data.map(entry => entry._id.건물용도))];

            purposes.forEach(purpose => {
                const trace = {
                    x: years,
                    y: data.filter(entry => entry._id.건물용도 === purpose).map(entry => entry.평균거래가격),
                    mode: 'lines+markers',
                    name: purpose,
                    hovertemplate: '%{x}년 : %{y}만'
                };
                traceData.push(trace);
            });

            const layout = {
                title: '용도별 연간 평균 거래 가격',
                xaxis: {
                    title: '연도'
                },
                yaxis: {
                    title: '평균 거래 가격',
                    tickformat: ',d' // 천 단위 구분자 추가
                }
            };

            Plotly.newPlot('plotly-chart', traceData, layout);
        });
    </script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});


//용도별 연별 거래량 수 --------------------------------------------------------------
router.get('/2', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);

    let purpose = req.query.purpose;
    let fromYear = req.query.fromYear;
    let toYear = req.query.toYear;

    console.log("받아온 쿼리 파라미터: ",fromYear,toYear,purpose);

    var purposeBoxName = req.query.purpose;
    var fromYearBoxName = req.query.fromYear;
    var toYearBoxName = req.query.toYear;
    if(req.query.purpose === undefined)
        purposeBoxName = "용도선택";
    if(req.query.fromYear === undefined)
        fromYearBoxName = "연도선택";
    if(req.query.toYear === undefined)
        toYearBoxName = "연도선택";

    const css = `
    <link rel="stylesheet" href="../css/submitbtn.css">
    `;
    const search = `
    <form id="yearForm" method="get">
    <div class="dropdown">
        <button type="button" class="dropbtn" id="purposeDropdownButton">${purposeBoxName}</button>
        <div class="dropdown-content">
            ${["아파트", "오피스텔", "연립다세대", "단독다가구"].map(data => 
                `<a href="#" onclick="handlePurposeSelect(event, '${data}')">${data}</a>`
            ).join('')}
        </div>
    </div>
    <div class="dropdown">
        <button type="button" class="dropbtn" id="fromYearDropdownButton">${fromYearBoxName}</button>
        <div class="dropdown-content">
            ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(data => 
                `<a href="#" onclick="handleFromYearSelect(event, ${data})">${data}</a>`
            ).join('')}
        </div>
    </div>
    &nbsp;~&nbsp;
    <div class="dropdown" id="toYearDropdown">
        <button type="button" class="dropbtn" id="toYearDropdownButton">${toYearBoxName}</button>
        <div class="dropdown-content" id="toYearDropdownContent">
            <!-- 종료 연도 옵션은 JavaScript를 통해 동적으로 생성됩니다 -->
        </div>
    </div>
    <div class="formsubmit" id="formSubmit" onclick="handleSubmit(event,'${purposeBoxName}','${fromYearBoxName}','${toYearBoxName}');" style="display:inline-block">
        <button type="button" class="submitbtn" id="nonformSubmit">조회</button>
    </div>
    <input type="hidden" name="purpose" id="purpose">
    <input type="hidden" name="fromYear" id="fromYear">
    <input type="hidden" name="toYear" id="toYear">
    </form>
    `;  
    
    let year1 = fromYear;
    year1 = parseInt(year1);
    let year2 = toYear;
    year2 = parseInt(year2);
    
    //6.용도별 연간 평균 거래량 
    const data1 = await collection.aggregate([
    { $match: {
        연도: { $gte: year1, $lte: year2 }
    }},
    { $group: {
        _id: { 연도: "$연도", 건물용도: "$건물용도" },
        거래량: { $sum: 1 }
    }},
    { 
        $sort: { "_id.건물용도": 1, "_id.연도": 1 }
    }
  ]).toArray(); // 결과를 배열로 변환
        

    console.log("받아온 쿼리 파라미터: ",data1);

    // 결과가 있는지 확인 후 출력
    const contents = (data1.length > 0) ? `
    <div id="plotly-chart"></div>
    <div>
    <h2>용도별 연간 평균 거래량</h2>
    <table>
        <thead>
            <tr>
                <th>연도</th>
                <th>건물 용도</th>
                <th>거래량</th>
            </tr>
        </thead>
        <tbody>
            ${data1.map(entry => `
                <tr>
                    <td>${entry._id.연도}</td>
                    <td>${entry._id.건물용도}</td>
                    <td>${entry.거래량}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    </div>` : '<div><p>결과가 없습니다.</p></div>';

    const js = `
    <script src="../js/2.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const data = ${JSON.stringify(data1)};
        const traceData = [];
        const years = [...new Set(data.map(entry => entry._id.연도))];
        const purposes = [...new Set(data.map(entry => entry._id.건물용도))];

        purposes.forEach(purpose => {
            const trace = {
                x: years,
                y: data.filter(entry => entry._id.건물용도 === purpose).map(entry => entry.거래량),
                mode: 'lines+markers',
                name: purpose,
                hovertemplate: '%{x}년도: %{y}회'
            };
            traceData.push(trace);
        });

        const layout = {
            title: '용도별 연간 평균 거래량',
            xaxis: {
                title: '연도'
            },
            yaxis: {
                title: '거래량',
                tickformat: ','  // 천 단위 구분자를 사용
            }
        };

        Plotly.newPlot('plotly-chart', traceData, layout);
    });
    </script>
    `;
    

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
    });

module.exports = router;