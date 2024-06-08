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
    const contents = (data1.length > 0) ? `
        <div id="plotly-chart"></div>
        <div>
            <h2>연도별 월별 거래량</h2>
            <table>
            <thead>
                <tr>
                    <th>월</th>
                    <th>계약량</th>
                </tr>
            </thead>
            <tbody>
                ${data1.map(monthData => `
                        <tr>
                            <td>${monthData._id}월</td>
                            <td>${monthData.계약수}건</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>` : '<div><p>결과가 없습니다.</p></div>';

    console.log(contents);


    const js = `
    <script src="../js/13.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
            const total = ${data1.reduce((acc, cur) => acc + cur.계약수, 0)}; // 총 거래량 계산

            const data = {
                labels: ${JSON.stringify(data1.map(monthData => monthData._id + '월'))},
                values: ${JSON.stringify(data1.map(monthData => monthData.계약수))},
                type: 'pie',
                name: '월별 계약량',
                hovertemplate: '%{label}: %{value}회 (%{percent})', // 백분율 추가
                textinfo: 'label+percent', // 라벨과 백분율 함께 표시 설정
                textposition: 'inside', // 텍스트 위치 설정
                marker: {
                    colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78'], // 각 월에 대한 색상 지정
                },
            };

            const layout = {
                title: '${year}년 월별 계약량',
                height: 800, // 그래프의 높이 조정
                width: 800, // 그래프의 너비 조정
            };

            Plotly.newPlot('plotly-chart', [data], layout);
        });
    </script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});



module.exports = router;