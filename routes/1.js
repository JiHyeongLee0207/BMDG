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

        var js = `
        <script src="../js/13.js"></script>
        `;
        
        var contents = `
        <div>
            <h1>가장 비싼/저렴한 건물</h1>
            <br>
            <p>해당 페이지는 서울시에서 가장 비싼 건물과 저렴한 건물 5개를 보여주는 페이지입니다.</p>
            <p>위의 박스에서 연도를 골라주세요.</p>
        </div>
        `;

        if(year){
            //1.연도를 입력받아 서울시에서 거래된 가장 비싼 건물의 정보 추출:
            const data1 = await collection.aggregate([
                { $match: { 연도: year } },
                { $sort: { "물건금액(만원)": -1 } },
                { $limit: 5 },
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
                { $limit: 5 },
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
            //console.log("받아온 쿼리 파라미터: ",data2);



            // 결과를 HTML로 구성
            contents = `
            <div>
                <h1>가장 비싼/저렴한 건물</h1>
                <br>
                <p>${year}년도 서울시에서 가장 비싼 건물과 저렴한 건물 5개입니다.</p>
            </div>

            <div id="plotly-chart"></div>`;

            js = `
            <script src="../js/13.js"></script>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                
                    // 시각화를 위한 데이터 가공
                    const expensiveBuildings = ${JSON.stringify(data1)};
                    const cheapBuildings = ${JSON.stringify(data2)};

                    const expensiveX = expensiveBuildings.map((building, index) => \`비싼 순위 \${index + 1}등\`);
                    const cheapX = cheapBuildings.map((building, index) => \`저렴한 순위 \${index + 1}등\`);

                    const expensiveY = expensiveBuildings.map(building => building["물건금액(만원)"]);
                    const cheapY = cheapBuildings.map(building => building["물건금액(만원)"]);

                    // customdata 속성에 각 건물의 추가 정보를 저장합니다.
                    const expensiveCustomData = expensiveBuildings.map(building => [
                        building["건물명"] || "익명", building["자치구명"]|| "비공개 ", building["법정동명"]|| "비공개 ", building["건물면적(㎡)"]|| "비공개 ", building["건물용도"]|| "비공개 "
                    ]);
                    const cheapCustomData = cheapBuildings.map(building => [
                        building["건물명"] || "익명", building["자치구명"]|| "비공개 ", building["법정동명"]|| "비공개 ", building["건물면적(㎡)"]|| "비공개 ", building["건물용도"]|| "비공개 "
                    ]);

                    const trace1 = {
                        x: expensiveX,
                        y: expensiveY,
                        type: 'bar',
                        name: '비싼 건물',
                        marker: {
                            color: '#ff7f0e'
                        },
                        customdata: expensiveCustomData,
                        hovertemplate: '건물명: %{customdata[0]}<br>자치구명: %{customdata[1]}<br>법정동명: %{customdata[2]}<br>물건금액(만원): %{y}만원<br>건물면적: %{customdata[3]}m^2<br>건물용도: %{customdata[4]}<extra></extra>'
                    };

                    const trace2 = {
                        x: cheapX,
                        y: cheapY,
                        type: 'bar',
                        name: '저렴한 건물',
                        marker: {
                            color: '#1f77b4'
                        },
                        customdata: cheapCustomData,
                        hovertemplate: '건물명: %{customdata[0]}<br>자치구명: %{customdata[1]}<br>법정동명: %{customdata[2]}<br>물건금액(만원): %{y}만원<br>건물면적: %{customdata[3]}m^2<br>건물용도: %{customdata[4]}<extra></extra>'
                    };

                    const data = [trace1, trace2];

                    const layout = {
                        title: {
                            text: '가장 비싼/저렴한 건물 정보',
                            font: {
                                size: 22,
                                color: 'black',
                                weight: 'bold'
                            }
                        },
                        barmode: 'group', // 그룹 모드 설정
                        yaxis: {
                            title: '물건금액(만원)',
                            tickformat: ',' // 천 단위 구분자를 사용하여 숫자를 표시합니다. 예: 1,000
                        }
                    };

                    // 시각화된 차트를 HTML에 추가
                    const divId = 'plotly-chart';
                    const plotData = data;
                    const plotLayout = layout;
                    Plotly.newPlot(divId, plotData, plotLayout);
                });
            </script>


            `;
        }

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
        //console.log("Converted selectedYear to Number:", selectedYear); // 변환된 selectedYear 값 로깅
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

    var js =`
    <script src="../js/13.js"></script>
    `;
    var contents = `
    <div>
        <h1>면적 대비 가장 비싼/저렴한 건물</h1>
        <br>
        <p>해당 페이지는 서울시에서 면적 대비 가장 비싼 건물과 저렴한 건물 10개를 보여주는 페이지입니다.</p>
        <p>위의 박스에서 연도를 골라주세요.</p>
    </div>
    `;

    if(year){
        // 연도를 입력받아 면적대비 가격이 비싼 건물 3개의 정보 추출
    const expensiveBuildings = await collection.aggregate([
        { $match: { 연도: year } },
        { $addFields: { "면적대비가격": { $divide: ["$물건금액(만원)", "$건물면적(㎡)"] } } },
        { $sort: { "면적대비가격": -1 } },
        { $limit: 10 },
        { $project: {
            "_id": 0,
            "연도": 1,
            "건물명": 1,
            "자치구명": 1,
            "법정동명": 1,
            "면적대비가격": 1,
            "층": 1,
            "건물용도": 1,
            "물건금액(만원)":1,
            "건물면적(㎡)":1
        }}
    ]).toArray();

    //int로 변환
    expensiveBuildings.forEach(building => {
        building.면적대비가격 = parseInt(building.면적대비가격);
    });


    console.log("받아온 쿼리 파라미!!!!!!!!!!!!!!!!!!!!: ",expensiveBuildings);

    // 연도를 입력받아 면적대비 가격이 싼 건물 3개의 정보 추출
    const cheapBuildings = await collection.aggregate([
        { $match: { 연도: year } },
        { $addFields: { "면적대비가격": { $divide: ["$물건금액(만원)", "$건물면적(㎡)"] } } },
        { $sort: { "면적대비가격": 1 } },
        { $limit: 10 },
        { $project: {
            "_id": 0,
            "연도": 1,
            "건물명": 1,
            "자치구명": 1,
            "법정동명": 1,
            "면적대비가격": 1,
            "층": 1,
            "건물용도": 1,
            "물건금액(만원)":1,
            "건물면적(㎡)":1
        }}
        
    ]).toArray();

    //int로 변환
    cheapBuildings.forEach(building => {
        building.면적대비가격 = parseInt(building.면적대비가격);
    });

    // 결과를 HTML로 구성
    contents = `
    <div>
        <h1>면적 대비 가장 비싼/저렴한 건물</h1>
        <br>
        <p>${year}년도 서울시에서 면적 대비 가장 비싼 건물과 저렴한 건물 10개입니다.</p>
    </div>
    <div id="plotly-chart"></div>
    `;
    
    console.log(contents);


    js = `
        <script src="../js/13.js"></script>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script>
    const expensiveBuildings = ${JSON.stringify(expensiveBuildings)};
    const cheapBuildings = ${JSON.stringify(cheapBuildings)};

    document.addEventListener('DOMContentLoaded', function () {
        const categories = expensiveBuildings.map((building, index) => \`순위 \${index + 1}등\`);

        const expensiveY = expensiveBuildings.map(building => building.면적대비가격);
        const cheapY = cheapBuildings.map(building => building.면적대비가격);

        // customdata 속성에 각 건물의 추가 정보를 저장합니다.
        const expensiveCustomData = expensiveBuildings.map(building => [
            building["건물명"] || "익명", 
            building["자치구명"]|| "비공개 ", 
            building["법정동명"]|| "비공개 ", 
            building["물건금액(만원)"]|| "비공개 ", 
            building["건물면적(㎡)"]|| "비공개 ", 
            building["건물용도"]|| "비공개 ",
            building["면적대비가격"]|| "비공개 "
        ]);

        const cheapCustomData = cheapBuildings.map(building => [
            building["건물명"] || "익명", 
            building["자치구명"]|| "비공개 ", 
            building["법정동명"]|| "비공개 ", 
            building["물건금액(만원)"]|| "비공개 ", 
            building["건물면적(㎡)"]|| "비공개 ", 
            building["건물용도"]|| "비공개 ",
            building["면적대비가격"]|| "비공개 "
        ]);

        const trace1 = {
            x: categories,
            y: expensiveY,
            type: 'bar',
            name: '비싼 건물',
            marker: {
                color: '#ff7f0e',
            },
            customdata: expensiveCustomData,
            hovertemplate: '건물명: %{customdata[0]}<br>자치구명: %{customdata[1]}<br>법정동명: %{customdata[2]}<br>물건금액(만원): %{customdata[3]}만원<br>건물면적: %{customdata[4]}㎡<br>건물용도: %{customdata[5]}<br>면적대비가격: %{customdata[6]} 만원/㎡<extra></extra>'
        };

        const trace2 = {
            x: categories,
            y: cheapY,
            type: 'bar',
            name: '싼 건물',
            marker: {
                color: '#1f77b4',
            },
            customdata: cheapCustomData,
            hovertemplate: '건물명: %{customdata[0]}<br>자치구명: %{customdata[1]}<br>법정동명: %{customdata[2]}<br>물건금액(만원): %{customdata[3]}만원<br>건물면적: %{customdata[4]}㎡<br>건물용도: %{customdata[5]}<br>면적대비가격: %{customdata[6]} 만원/㎡<extra></extra>'
        };

        const data = [trace1, trace2];

        const layout = {
            title: {
                text: '면적 1m^2당 가격정보',
                font: {
                    size: 22,
                    color: 'black',
                    family: 'Arial, Helvetica, sans-serif', // 둥글한 글씨체 설정
                    weight: 'bold'
                }
            },
            barmode: 'overlay', // 막대를 겹쳐서 표시
            yaxis: {
                title: {
                    text: '물건금액(만원)',
                    font: {
                        size: 14,
                        color: 'black',
                        family: 'Arial, Helvetica, sans-serif', // 둥글한 글씨체 설정
                        weight: 'bold'
                    }
                },
                tickformat: ',', // 천 단위 구분자를 사용하여 숫자를 표시합니다.
            },
            bargap: 0.4, // 요소별 간격 조정
            bargroupgap: 0.1 // 그룹 간격 조정
        };

        Plotly.newPlot('plotly-chart', data, layout);
    });
</script>

        `;
    }
    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});

module.exports = router;