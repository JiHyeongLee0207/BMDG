const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
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
    await client.connect();
    const db = client.db("BMDG");
    const collection = db.collection("budongsan");
    var { year, purpose } = req.query;

    const css = `<link rel="stylesheet" href="../css/submitbtn.css">`;
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
                ${[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006].map(year => 
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
    var contents = `
    <div>
        <h1>자치구별 거래량</h1>
        <br>
        <p>해당 페이지는 서울시 자치구별 부동산 거래량을 보여주는 페이지입니다.</p>
        <p>위의 박스에서 용도와 연도를 골라주세요.</p>
    </div>
    `;
    const js = `<script src="../js/4.js"></script>`;

    if (year && purpose) {
        fs.readFile(`./public/cacheData/${year}_${purpose}.html`, 'utf8', (err, data) => {
            if (err) {
                console.error('파일을 읽는 중 오류가 발생했습니다:', err);
                return;
            }
            contents = `
            <div>
                <h1>자치구별 거래량</h1>
                <br>
                <p>${year}년도 서울시 자치구별 ${purpose} 거래량입니다.</p>
            </div>
            <div>
                ${data}
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
            </div>
            `
            res.send(template.make_page(css, search, contents, js));
        });
    }
    else{
        res.send(template.make_page(css, search, contents, js));
    }
});

//최대 평균가격 자치구 정보--------------------------------------------------------------
router.get('/2', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db("BMDG");
    const collection = db.collection("budongsan");
    var { year, purpose } = req.query;

    const css = `<link rel="stylesheet" href="../css/submitbtn.css">`;
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
                ${[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006].map(year => 
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
    var contents = `
    <div>
        <h1>자치구별 평균 가격</h1>
        <br>
        <p>해당 페이지는 서울시 자치구별 부동산 평균 가격을 보여주는 페이지입니다.</p>
        <p>위의 박스에서 용도와 연도를 골라주세요.</p>
    </div>
    `;
    const js = `<script src="../js/4.js"></script>`;

    if (year && purpose) {
        fs.readFile(`./public/cacheData2/${year}_${purpose}.html`, 'utf8', (err, data) => {
            if (err) {
                console.error('파일을 읽는 중 오류가 발생했습니다:', err);
                return;
            }
            contents = `
            <div>
                <h1>자치구별 평균 가격</h1>
                <br>
                <p>${year}년도 서울시 자치구별 ${purpose} 평균 가격입니다.</p>
            </div>
            <div>
                ${data}
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
                <p>&nbsp</p>
            </div>
            `
            res.send(template.make_page(css, search, contents, js));
        });
    }
    else{
        res.send(template.make_page(css, search, contents, js));
    }
});


//자치구별 거래량 정보--------------------------------------------------------------
router.get('/3', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    let gu = req.query.gu;
    let purpose = req.query.purpose;
    let year = req.query.year;

    if (!Number.isInteger(parseInt(year))) {
        year = parseInt(year);
        console.log("Converted year to Number:", year);
    }
    console.log("받아온 쿼리 파라미터: ",gu,purpose,year);

    const css = `
    <link rel="stylesheet" href="../css/submitbtn.css">
    `;
    const search = `
    <form id="yearForm" method="get">
        <div class="dropdown">
            <button type="button" class="dropbtn" id="guDropdownButton">지역구</button>
            <div class="dropdown-content">
                ${[
                    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", 
                    "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", 
                    "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", 
                    "은평구", "종로구", "중구", "중랑구"
                ].map(data => 
                    `<a href="#" onclick="handleGuSelect(event, '${data}')">${data}</a>`
                ).join('')}
            </div>
        </div>
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
                ${[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006].map(year => 
                    `<a href="#" onclick="handleYearSelect(event, ${year})">${year}</a>`
                ).join('')}
            </div>
        </div>
        <div class="formsubmit" id="formSubmit" onclick="handleSubmit(event);" style="display:inline-block">
            <button type="button" class="submitbtn" id="nonformSubmit">조회</button>
        </div>
        <input type="hidden" name="gu" id="gu">
        <input type="hidden" name="purpose" id="purpose">
        <input type="hidden" name="year" id="year">
    </form>
    `;

    year = parseInt(year);

    var js = `
    <script src="../js/4.js"></script>
    `;
    
    var contents = `
    <div>
        <h1>동별 거래량</h1>
        <br>
        <p>해당 페이지는 서울시 특정 구의 동별 부동산 거래량을 보여주는 페이지입니다.</p>
        <p>위의 박스에서 구와 용도, 그리고 연도를 골라주세요.</p>
    </div>
    `;

    if(gu && purpose && year){
        //10. 거래가 가장 많이 발생하는 법정동 25개 역순 정렬
        const data1 = await collection.aggregate([
            { $match: { 연도: year, 건물용도: purpose, 자치구명: gu } },
            { $group: { _id: "$법정동명", 거래량: { $sum: 1 } } },
            { $sort: { 거래량: -1 } },
            { $limit: 25 }
        ]).toArray(); // 결과를 배열로 변환
        console.log("받아온 쿼리 파라미터: ",data1);


        contents = (data1.length > 0) ? `
        <div>
            <h1>동별 거래량</h1>
            <br>
            <p>${year}년도 서울시 ${gu}구의 동별 ${purpose} 거래량입니다.</p>
        </div>
        
        <div id="plotly-chart"></div>
        <div>
        <h2> ${gu}에서 거래가 가장 많이 발생하는 법정동 목록</h2>
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

        js = `
        <script src="../js/4.js"></script>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script>
        document.addEventListener('DOMContentLoaded', async function() {
            const data = {
                labels: ${JSON.stringify(data1.map(districtData => districtData._id))}, // 동명
                values: ${JSON.stringify(data1.map(districtData => districtData.거래량))}, // 거래량
                type: 'pie', // 차트 유형: 파이 차트
                hovertemplate: '%{value} 건 (%{percent})',
                textinfo: 'label+value+percent', // 레이블, 값, 퍼센트 표시
                textposition: 'inside', // 레이블을 파이 차트 바깥에 위치
            };

            const layout = {
                title: '${gu}에서 거래가 가장 많이 발생하는 법정동 목록',
            };

            Plotly.newPlot('plotly-chart', [data], layout);

            document.getElementById('plotly-chart').style.display = 'flex';
            document.getElementById('plotly-chart').style.justifyContent = 'center';
            document.getElementById('plotly-chart').style.alignItems = 'center';
        });
        </script>
        `;
    }

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
    });


//자치구별 평균가격 정보--------------------------------------------------------------
router.get('/4', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);
    let gu = req.query.gu;
    let purpose = req.query.purpose;
    let year = req.query.year;

    if (!Number.isInteger(parseInt(year))) {
        year = parseInt(year);
        console.log("Converted year to Number:", year);
    }
    console.log("받아온 쿼리 파라미터: ",gu,purpose,year);

    const css = `
    <link rel="stylesheet" href="../css/submitbtn.css">
    `;
    const search = `
    <form id="yearForm" method="get">
        <div class="dropdown">
            <button type="button" class="dropbtn" id="guDropdownButton">지역구</button>
            <div class="dropdown-content">
                ${[
                    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", 
                    "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", 
                    "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", 
                    "은평구", "종로구", "중구", "중랑구"
                ].map(data => 
                    `<a href="#" onclick="handleGuSelect(event, '${data}')">${data}</a>`
                ).join('')}
            </div>
        </div>
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
                ${[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006].map(year => 
                    `<a href="#" onclick="handleYearSelect(event, ${year})">${year}</a>`
                ).join('')}
            </div>
        </div>
        <div class="formsubmit" id="formSubmit" onclick="handleSubmit(event);" style="display:inline-block">
            <button type="button" class="submitbtn" id="nonformSubmit">조회</button>
        </div>
        <input type="hidden" name="gu" id="gu">
        <input type="hidden" name="purpose" id="purpose">
        <input type="hidden" name="year" id="year">
    </form>
    `;

    year = parseInt(year);

    year = parseInt(year);

    var js = `
    <script src="../js/4.js"></script>
    `;
    
    var contents = `
    <div>
        <h1>동별 평균 가격</h1>
        <br>
        <p>해당 페이지는 서울시 특정 구의 동별 부동산 평균 가격을 보여주는 페이지입니다.</p>
        <p>위의 박스에서 구와 용도, 그리고 연도를 골라주세요.</p>
    </div>
    `;

    if(gu && purpose && year){
        //11.법정동별 가격평균값 역순 정렬
        const data1 = await collection.aggregate([
            { $match: { 연도: year, 건물용도: purpose,자치구명: gu } },
            { $group: { _id: "$법정동명", 평균가격: { $avg: "$물건금액(만원)" } } },
            { $sort: { 평균가격: -1 } }
        ]).toArray(); // 결과를 배열로 변환
        console.log("받아온 쿼리 파라미터: ",data1);

        //int로 변환
        data1.forEach(building => {
            building.평균가격 = parseInt(building.평균가격);
        });

        // 결과가 있는지 확인 후 출력
        contents = (data1.length > 0) ? `
        <div>
            <h1>동별 평균 가격</h1>
            <br>
            <p>${year}년도 서울시 ${gu}구의 동별 ${purpose} 평균 가격입니다.</p>
        </div>

        <div id="plotly-chart"></div>
        <div>
        <h2> ${gu}에서의 동별 평균가 목록</h2>
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
                        <td>${template.formatKoreanCurrency(districtData.평균가격.toFixed(0))}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>` : '<div><p>결과가 없습니다.</p></div>';


        js = `
        <script src="../js/4.js"></script>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script>
        document.addEventListener('DOMContentLoaded', async function() {
            const data = {
                labels: ${JSON.stringify(data1.map(districtData => districtData._id))}, // 동명
                values: ${JSON.stringify(data1.map(districtData => districtData.평균가격))}, // 평균가격
                type: 'pie', // 차트 유형: 파이 차트
                hovertemplate: '%{value} 만원 (%{percent})',
                textinfo: 'label+value+percent', // 레이블, 값, 퍼센트 표시
                textposition: 'inside', // 레이블을 파이 차트 안쪽에 위치
            };

            const layout = {
                title: '${gu}에서의 동별 평균가 목록',
            };

            Plotly.newPlot('plotly-chart', [data], layout);

            document.getElementById('plotly-chart').style.display = 'flex';
            document.getElementById('plotly-chart').style.justifyContent = 'center';
            document.getElementById('plotly-chart').style.alignItems = 'center';
        });
        </script>
        `;
    }

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
    });

module.exports = router;
