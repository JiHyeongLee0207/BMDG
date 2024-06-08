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


//월별 정보--------------------------------------------------------------
router.get('/1', async (req, res, next) => {
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

    var js = `
    <script src="../js/13.js"></script>
    `;
    
    var contents = `
    <div>
        <h1>월별 계약량</h1>
        <br>
        <p>해당 페이지는 서울시 월별 부동산 거래량을 보여주는 페이지입니다.</p>
        <p>위의 박스에서 연도를 골라주세요.</p>
    </div>
    `;

    if(year){
        //7.월별 계약량
        const data1 = await collection.aggregate([
            { $match: {연도: year } },
            { $project: {
                월: { $substrBytes: ["$계약일", 4, 2] }, // '계약일' 필드에서 5번째 위치부터 2자리(월)를 추출
                계약일: 1 }// 계약일 필드를 유지
            },
            { $group: {
                _id: "$월", // 월별로 그룹화
                계약수: { $sum: 1 }
                } // 그룹에 포함된 문서의 수를 센다
            },
            {$sort: { _id: 1 } // 월별로 정렬
            }
        ]).toArray(); // 결과를 배열로 변환

        console.log("받아온 쿼리 파라미터: ",data1);



        // 결과가 있는지 확인 후 출력
        contents = `
        <div>
            <h1>월별 계약량</h1>
            <br>
            <p>서울시 ${year}년도 월별 부동산 거래량을 보여주는 페이지입니다.</p>
        </div>

        <div id="plotly-chart"></div>`;

        console.log(contents);


        js = `
        <script src="../js/13.js"></script>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const labels = ${JSON.stringify(data1.map(monthData => monthData._id + '월'))};
                const values = ${JSON.stringify(data1.map(monthData => monthData.계약수))};
                
                // 바 차트 데이터
                const barData = {
                    x: labels,
                    y: values,
                    type: 'bar',
                    name: '',
                    marker: {
                        color: [
                            '#1f77b4', // 진한 파랑
                            '#2ca02c', // 초록
                            '#17becf', // 하늘색
                            '#aec7e8', // 연한 파랑
                            '#7fcdbb', // 연한 청록
                            '#ff7f0e', // 주황
                            '#9467bd', // 보라
                            '#8c564b', // 갈색
                            '#d62728', // 빨강
                            '#ff9896', // 연한 빨강
                            '#c5b0d5', // 연한 보라
                            '#8c564b'  // 갈색
                        ],
                    },
                    hovertemplate: '%{x}: %{y}회',
                };

                // 추세선 데이터
                const trendData = {
                    x: labels,
                    y: values,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: '추세선',
                    line: {
                        color: '#ff7f0e',
                        width: 2,
                    },
                    marker: {
                        size: 8,
                    },
                    hoverinfo: 'none',
                };

                const data = [barData, trendData];

                const layout = {
                    title: {
                        text: '${year}년 월별 계약량 및 추세선',
                        font: {
                            size: 22,
                            color: 'black',
                            family: 'Arial, Helvetica, sans-serif', // 둥글한 글씨체 설정
                            weight: 'bold'
                        }
                    },
                    height: 600,
                    width: 1000,
                    xaxis: {
                        title: '월',
                    },
                    yaxis: {
                        title: '계약량(회)',
                        tickformat: ',',
                    },
                    bargap: 0.4, // 막대 간격 조정
                };

                Plotly.newPlot('plotly-chart', data, layout);
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