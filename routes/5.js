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

// 쿼리 12 ,13 이돈으로 몇년?(평균가&최고가): -----------------------------------------------------------------------------------------------------------------------
router.get('/1', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);

    let { 
        gu,
        purpose,
        year,
        areaRange,
        rateIncrease, // 체크박스
        income, 
        considerExpenses, // 체크박스
        annualExpenses ,
        years
    } = req.query;

    // numer로 변환
    year = req.query.year;
    income = req.query.income;
    annualExpenses = req.query.annualExpenses;
    if (!Number.isInteger(parseInt(year))) {
        year = parseInt(year);
        console.log("Converted year to Number:", year); // 변환된 year 값 로깅
    }
    if (!Number.isInteger(parseInt(income))) {
        income = parseInt(income);
        console.log("Converted income to Number:", income); // 변환된 year 값 로깅
    }

    if (!Number.isInteger(parseInt(annualExpenses))) {
        annualExpenses = parseInt(annualExpenses);
        console.log("Converted year to Number:", annualExpenses); // 변환된 year 값 로깅
    }

    if (!Number.isInteger(parseInt(years))) {
        years = parseInt(years);
        console.log("Converted year to Number:", years); // 변환된 year 값 로깅
    }
    


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

        <div class="dropdown">
            <button type="button" class="dropbtn" id="areaRangeDropdownButton">면적</button>
            <div class="dropdown-content">
                ${["20평 이하", "20평~32평", "32평~44평", "44평 이상"].map(area => 
                    `<a href="#" onclick="handleAreaRangeSelect(event, '${area}')">${area}</a>`
                ).join('')}
            </div>
        </div>

        <div class="checkbox">
            <div class="checkbox-inner">
                <div>
                    <input class="dropbtn dropbtn2" type="number" name="income" placeholder="세후 연봉 (만원)">
                </div>
                <div>
                    <input type="checkbox" name="rateIncrease" checked>
                    <p>수익률 상승률 고려<p>
                </div>
                <div>
                    <input class="dropbtn dropbtn2" type="number" name="annualExpenses" placeholder="한달 지출 (만원)">
                </div>
                <div>
                    <input type="checkbox" name="considerExpenses" checked>
                    <p>지출 상승률 고려<p>
                </div>
            </div>
        </div>
        &nbsp;X&nbsp;
        <div class="dropdown">
            <input class="dropbtn" type="number" name="years" placeholder="몇 년 동안?">
        </div>

        <div class="formsubmit" id="formSubmit" onclick="handleSubmit(event);" style="display:inline-block">
            <button type="button" class="submitbtn" id="nonformSubmit">조회</button>
        </div>
        
        <input type="hidden" name="gu" id="gu">
        <input type="hidden" name="purpose" id="purpose">
        <input type="hidden" name="year" id="year">
        <input type="hidden" name="areaRange" id="areaRange">
    </form>
    `;

    // 받아온 파라미터들을 콘솔에 출력
    console.log("받아온 파라미터들: ",
        gu,
        purpose,
        year,
        areaRange,
        rateIncrease, // 체크박스
        income, 
        considerExpenses, // 체크박스
        annualExpenses,
        years
    );

    // 연도, 수입, 연간 지출, 목표 저축 연도를 정수로 변환
    year = parseInt(year);
    income = parseInt(income);
    annualExpenses = parseInt(annualExpenses);
    years = parseInt(years);

    var contents = `
    <div>
        <h1>이 돈으로 뭘?</h1>
        <br>
        <p>해당 페이지는 당신의 몇 년간의 순수익을 계산하여 어떤 건물을 살 수 있는지를 보여주는 페이지입니다.</p>
        <p>위의 박스에서 당신의 조건을 입력하세요.</p>
    </div>
    `;
    var js = `<script src="../js/5.js"></script>`;

    if(gu && purpose && year && areaRange && rateIncrease && income && considerExpenses && annualExpenses){
        // MongoDB 쿼리를 위한 matchStage 객체 초기화
        const matchStage = {
            $match: {
                연도: year,
                건물용도: purpose,
                자치구명: gu,
            }
        };

        // 건물면적에 따라 matchStage 객체에 조건 추가
        switch(areaRange) {
            case '20평 이하':
                matchStage.$match['건물면적(㎡)'] = { $lte: 66 };
                break;
            case '20평~32평':
                matchStage.$match['건물면적(㎡)'] = { $lte: 105, $gt: 66 };
                break;
            case '32평~44평':
                matchStage.$match['건물면적(㎡)'] = { $lte: 145, $gt: 105 };
                break;
            case '44평 이상':
                matchStage.$match['건물면적(㎡)'] = { $gt: 145 };
                break;
            default:
                break;
        }

        // 목표 저축 연도 동안의 총 저축액 계산
        let totalSavings = 0;
        let currentIncome = income;
        let expense = 12*annualExpenses; //지출
        const realannualExpenses=annualExpenses*12;

        for (let i = 0; i < years; i++) {
            totalSavings += currentIncome;
            totalSavings -= expense;
            if (rateIncrease) currentIncome *= 1.037; // 수입 상승률 적용 (3.7% 상승)
            if (considerExpenses) expense *= 1.024; // 지출 상승률 적용 (2.4% 상승)
        }


        const RrateIncrease = rateIncrease === "on" ? 1 : 0;
        const RconsiderExpenses = considerExpenses === "on" ? 1 : 0;

        // 총 저축액으로 구매 가능한 건물들을 조회
        const affordableBuildings = await collection.aggregate([
            matchStage,
            {
                $match: {
                    "물건금액(만원)": { $lte: totalSavings } // 총 저축액 이내의 건물 조회
                }
            },
            {
                $sort: { "물건금액(만원)": -1 } // 물건금액(만원)을 기준으로 내림차순 정렬
            },
            {
                $limit: 50 // 결과를 상위 50개 건물로 제한
            }
        ]).toArray();

        // 구매 가능한 건물들의 정보를 HTML 표로 만듦
        let affordableContents = '';
        affordableBuildings.forEach(building => {
            affordableContents += `
                <tr>
                    <td>${building.건물명}</td>
                    <td>${template.formatKoreanCurrency(building["물건금액(만원)"].toFixed(0))}</td>
                </tr>`;
        });

        // 결과를 HTML 형식으로 포맷하여 생성
        contents = `
        <div>
            <p>해당 지표는 부동산 가격의 변동을 제외하였습니다.</p>
            <p>물가상승률은 공개된 통계 자료의 평균인 2.4%,</p>
            <p>임금 상승률은 공개된 통계 자료의 평균인 3.7%를 적용했습니다.</p>
            <div>
                <h2>아래는 당신이 일하기 시작한 첫 연도의 순이익을 계산한 것입니다.</h2>
            </div>
            <div id="plotly-chart1">
            </div>
        </div>
        <div>
            <div>
                <h2>아래는 ${years}년간 당신이 돈을 저축하는 과정을 나타낸 것입니다.</h2>
            </div>
            <div id="plotly-chart2"></div>
        </div>
        <div>
        ${affordableBuildings.length > 0 ? `

            <div id="plotly-chart2"></div>
            <div>
                <h1>${year}년 기준 ${gu}에서 ${areaRange} ${purpose}를 사려고 한다 
                <br>매년 연봉 ${template.formatKoreanCurrency(income)}으로 한달에 ${template.formatKoreanCurrency(annualExpenses)}씩 쓸때</h1>
                <h2>단 한번도 안짤리고 연속으로 ${years}년 만큼 일하면 살수있는 ${purpose}와 가격</h2>
                <h2>내가번돈 ${totalSavings}</h2>
                <table>    
                    <thead>
                        <tr>
                            <th>건물명</th>
                            <th>가격</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${affordableContents}
                    </tbody>
                </table>
            </div>
            <div id="plotly-chart"></div>
        ` : `'<div><h1> ${year}년 기준 ${gu}에서 ${areaRange} ${purpose}를 사려고 할때, <br>매년 연봉 ${template.formatKoreanCurrency(income)}으로 한달에 ${template.formatKoreanCurrency(annualExpenses)}씩 쓸때</h1><h2>단 한번도 안짤리고 연속으로 ${years}년 만큼 일해도 살수있는 ${purpose}(이)가 없습니다.</h2></div>'`}
        </div>
        `;

        js = `
        <script src="../js/5.js"></script>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script> // 수입, 지출, 순수익차트
            document.addEventListener("DOMContentLoaded", function(event) {
                // 수입, 지출, 순수익 계산
                const income = ${income};
                const expense = ${realannualExpenses};
                const netIncome = income - expense;
    
                var data = [
                    {
                        name: "수입+지출+자금", // 차트 이름
                        type: "waterfall", // 차트 유형
                        orientation: "v", // 차트 방향 (수직)
                        measure: [
                            "relative", // 상대값으로 시작
                            "relative", // 총합값으로 종료
                            "total" // 총합값으로 종료
                        ],
                        x: [
                            "수입", // x축 레이블
                            "지출", // x축 레이블
                            "자금" // x축 레이블
                        ],
                        textposition: "outside",
                        text: [
                            income + "만원", // 수입 값
                            -expense + "만원", // 지출 값 (수입에서 빼므로 음수로 표시)
                            netIncome + "만원"// 자금 값
                        ],          
                        y: [
                            income, // 수입 값
                            -expense, // 지출 값 (수입에서 빼므로 음수로 표시)
                            netIncome // 자금 값
                        ],
                        hovertemplate: '%{y}만원<extra></extra>', // <--- 여기에 hoverinfo 속성 추가
                        connector: {
                            line: {
                                color: "rgb(63, 63, 63)"
                            }
                        },
                    }
                ];
    
                var layout = {
                    title: {
                        text: "수입, 지출, 자금" // 차트 제목
                    },
                    xaxis: {
                        type: "category" // x축 타입
                    },
                    yaxis: {
                        type: "linear", // y축 타입
                        range: [0, Math.max(income, -expense, netIncome) * 1.2] // y축 범위 조정
                    },
                    autosize: true, // 차트 크기 자동 조정
                    showlegend: true // 범례 표시 여부
                };
    
                Plotly.newPlot('plotly-chart1', data, layout); // 차트 생성
            });
        </script>

        <script>
            document.addEventListener("DOMContentLoaded", function(event) {
                // 수입, 지출, 순수익 계산 및 초기 설정
                let currentIncome = ${income}; // 현재 수입
                let expense = ${realannualExpenses}; // 월 지출을 연간 지출로 변환
                let netIncome = currentIncome - expense; // 순수익
                let target = ${totalSavings}; // 목표 가격

                // 상승률 고려 체크박스 상태 가져오기
                const rateIncrease = ${RrateIncrease}; // 수익률 상승률 고려 여부
                const considerExpenses = ${RconsiderExpenses}; // 지출 상승률 고려 여부

                // 반복 횟수 설정
                const repeatCount = ${years}; // 필요한 연도 계산 결과 사용
                var xValues = [];
                var yValues = [];
                var textValues = [];
                var measures = [];

            // 반복해서 데이터 생성
                for (let i = 0; i < repeatCount; i++) {
                    xValues.push(\`수입 \${i+1}\`);
                    yValues.push(currentIncome);
                    textValues.push(currentIncome.toFixed(0) + "만원");
                    measures.push("relative");

                    xValues.push(\`지출 \${i+1}\`);
                    yValues.push(-expense);
                    textValues.push((-expense).toFixed(0) + "만원");
                    measures.push("relative");

                    xValues.push(\`\${i+1}년\`);
                    yValues.push(currentIncome-expense);
                    textValues.push((currentIncome-expense).toFixed(0) + "만원");
                    measures.push("total");


                    // 수입과 지출에 상승률 적용
                    if (rateIncrease) currentIncome *= 1.037; // 수입 상승률 적용
                    if (considerExpenses) expense *= 1.024; // 지출 상승률 적용
                }

                var data = [{
                    name: "수입+지출+순수익",
                    type: "waterfall",
                    orientation: "v",
                    measure: measures,
                    x: xValues,
                    textposition: "outside",
                    text: textValues,
                    y: yValues,
                    hovertemplate: '%{y:,.0f}만원<extra></extra>',
                    connector: {
                        line: {
                            color: "rgb(63, 63, 63)"
                        }
                    },
                }];

                var layout = {
                    title: {
                        text: "구매까지 ${years}년 반복  " // 차트 제목
                    },
                    xaxis: {
                        type: "category" // x축 타입
                    },
                    yaxis: {
                        title: '평균 거래 가격(만원)',
                        type: "linear", // y축 타입
                        range: [0,target+10000], // y축 범위 조정
                        tickformat: ',', // 천 단위마다 쉼표 추가
                        hoverformat: ',' // hover 시 천 단위마다 쉼표 추가
                    },
                    autosize: true, // 차트 크기 자동 조정
                    showlegend: true // 범례 표시 여부
                };

                Plotly.newPlot('plotly-chart2', data, layout); // 차트 생성
            });
        </script>

        <script>
            document.addEventListener("DOMContentLoaded", function(event) {
                // MongoDB에서 받아온 데이터를 const js에 저장
                const js = ${JSON.stringify(affordableBuildings)};

                // x축 (건물 번호)와 y축 (물건금액)을 위한 데이터 생성
                const xValues = js.map((_, index) => index + 1);
                const yValues = js.map(building => building["물건금액(만원)"]);
                const textValues = js.map(building => building["건물명"]);

                var data = [{
                    x: xValues,
                    y: yValues,
                    mode: 'markers',
                    type: 'scatter',
                    marker: {
                        size: 10,
                        color: 'rgba(156, 165, 196, 0.95)',
                        line: {
                            width: 1,
                            color: 'rgb(0, 0, 0)'
                        }
                    },
                    hovertemplate: '건물 번호: %{x}<br>가격: %{y}만원<br>건물명: %{text}<extra></extra>',
                    text: textValues // 건물명 추가
                }];

                var layout = {
                    title: {
                        text: '총 저축액으로 구매 가능한 건물들'
                    },
                    xaxis: {
                        title: '건물 번호',
                        tickformat: 'd'
                    },
                    yaxis: {
                        title: '가격 (만원)',
                        tickformat: ','
                    },
                    autosize: true
                };

                Plotly.newPlot('plotly-chart', data, layout); // 차트 생성

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
































// Query 14: 이돈으로 뭘? -----------------------------------------------------------------------------------------------------------------------
router.get('/2', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);

    let { 
        gu,
        purpose,
        year,
        areaRange,
        rateIncrease, // 체크박스
        income, 
        considerExpenses, // 체크박스
        annualExpenses 
    } = req.query;

    // numer로 변환
    year = req.query.year;
    income = req.query.income;
    annualExpenses = req.query.annualExpenses;
    if (!Number.isInteger(parseInt(year))) {
        year = parseInt(year);
        console.log("Converted year to Number:", year); // 변환된 year 값 로깅
    }
    if (!Number.isInteger(parseInt(income))) {
        income = parseInt(income);
        console.log("Converted income to Number:", income); // 변환된 year 값 로깅
    }

    if (!Number.isInteger(parseInt(annualExpenses))) {
        annualExpenses = parseInt(annualExpenses);
        console.log("Converted year to Number:", annualExpenses); // 변환된 year 값 로깅
    }

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

        <div class="dropdown">
            <button type="button" class="dropbtn" id="areaRangeDropdownButton">면적</button>
            <div class="dropdown-content">
                ${["20평 이하", "20평~32평", "32평~44평", "44평 이상"].map(area => 
                    `<a href="#" onclick="handleAreaRangeSelect(event, '${area}')">${area}</a>`
                ).join('')}
            </div>
        </div>

        <div class="checkbox">
            <div class="checkbox-inner">
                <div>
                    <input type="number" name="income" placeholder="세후 연봉 (만원)">
                </div>
                <div>
                    <input type="checkbox" name="rateIncrease" checked>
                    <p>수익률 상승률 고려<p>
                </div>
                <div>
                    <input type="number" name="annualExpenses" placeholder="한달 지출 (만원)">
                </div>
                <div>
                    <input type="checkbox" name="considerExpenses" checked>
                    <p>지출 상승률 고려<p>
                </div>
            </div>
        </div>

        <div class="formsubmit" id="formSubmit" onclick="handleSubmit(event);" style="display:inline-block">
            <button type="button" class="submitbtn" id="nonformSubmit">조회</button>
        </div>
        
        <input type="hidden" name="gu" id="gu">
        <input type="hidden" name="purpose" id="purpose">
        <input type="hidden" name="year" id="year">
        <input type="hidden" name="areaRange" id="areaRange">
    </form>
    `;

    console.log("받아온 파라미터들: ",
        gu,
        purpose,
        year,
        areaRange,
        rateIncrease, // 체크박스
        income, 
        considerExpenses, // 체크박스
        annualExpenses );

    year = parseInt(year);
    income = parseInt(income);
    annualExpenses = parseInt(annualExpenses);

    var contents = `
    <div>
        <h1>이 돈으로 몇 년?</h1>
        <br>
        <p>해당 페이지는 당신의 수익과 지출을 계산하여 특정 조건에 부합하는 건물을 사는 데까지 걸리는 시간을 환산한 페이지입니다.</p>
        <p>위의 박스에서 당신의 조건을 입력하세요.</p>
    </div>
    `;
    var js = `<script src="../js/5.js"></script>`;

    if(gu && purpose && year && areaRange && rateIncrease && income && considerExpenses && annualExpenses){
        const matchStage = {
            $match: {
                연도: year,
                건물용도: purpose,
                자치구명: gu,
            }
        };
    
        switch(areaRange) {
            case '20평 이하':
                matchStage.$match['건물면적(㎡)'] = { $lte: 66 };
                break;
            case '20평~32평':
                matchStage.$match['건물면적(㎡)'] = { $lte: 105, $gt: 66 };
                break;
            case '32평~44평':
                matchStage.$match['건물면적(㎡)'] = { $lte: 145, $gt: 105 };
                break;
            case '44평 이상':
                matchStage.$match['건물면적(㎡)'] = { $gt: 145 };
                break;
            default:
                break;
        }
        //쿼리12 이돈으로 몇년?(평균가)
        const avgPriceData = await collection.aggregate([
            matchStage,
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: "$물건금액(만원)" }
                }
            }
        ]).toArray();
    
        const avgPrice = avgPriceData.length > 0 ? avgPriceData[0].avgPrice : 0;
    
        // 필요한 연도를 계산하는 데 사용될 변수 및 초기화
        let yearsRequired = 0; //필요년도
        let currentSavings = 0; //현재 저축액
        let currentIncome = income; //현재 수입
        let expense = 12*annualExpenses; //지출
    
        // 평균 가격보다 적절한 저축이 될 때까지 반복하여 연도를 계산
        // 최고가를 가진 건물의 가격보다 적절한 저축이 될 때까지 반복하여 연도를 계산
        while (currentSavings < avgPrice) {
            currentSavings += currentIncome;  // 수입 저축
            currentSavings -= expense; // 지출 빼기
            if (rateIncrease) currentIncome *= 1.037; // 수입 상승률 적용 (3.7% 상승)
            if (considerExpenses) expense *= 1.024; // 지출 상승률 적용 (2.4% 상승)
            yearsRequired++; // 소요된 연도 증가
        }
        const answer = yearsRequired;
        const realannualExpenses=annualExpenses*12;
        // 스크립트 바깥쪽에 const로 값이 on이면 1, 아니면 0으로 설정

        const RrateIncrease = rateIncrease === "on" ? 1 : 0;
        const RconsiderExpenses = considerExpenses === "on" ? 1 : 0;
        
        // 기준표 : kosis 국가통계표
        // 임금 상승률 12~23년간 총 12년 평균 3.7
        // 물가상승률  총 18년간 평균 2.39
    
        // 쿼리13: 최고가를 가진 5개 건물 정보를 가져옴
        const top5Data = await collection.aggregate([
            matchStage, // 사용자가 선택한 조건에 따라 문서 필터링
            { $sort: { "물건금액(만원)": -1 } }, // 물건금액(만원)을 기준으로 내림차순 정렬
            { $limit: 5 } // 상위 5개 결과만 반환
        ]).toArray();
        
        // 최고가를 가진 5개 건물의 정보를 반복하여 연도를 계산하고 HTML 표로 만듦
        let top5Contents = '';
        top5Data.forEach(building => {
            let yearsRequired2 = 0;
            let currentSavings2 = 0;
            let currentIncome = income;
            let expense = 12*annualExpenses; //지출
            
            // 최고가를 가진 건물의 가격보다 적절한 저축이 될 때까지 반복하여 연도를 계산
            while (currentSavings2 < building["물건금액(만원)"]) {
                currentSavings2 += currentIncome;  // 수입 저축
                currentSavings2 -= expense; // 지출 빼기
                if (rateIncrease) currentIncome *= 1.037; // 수입 상승률 적용 (3.7% 상승)
                if (considerExpenses) expense *= 1.024; // 지출 상승률 적용 (2.4% 상승)
                yearsRequired2++; // 소요된 연도 증가
            }
        
            // 최고가 건물 정보를 HTML 형식의 문자열로 추가
            top5Contents += `
                <tr>
                    <td>${building.건물명}</td>
                    <td>${template.formatKoreanCurrency(building["물건금액(만원)"].toFixed(0))}</td>
                    <td>${yearsRequired2}년</td>
                </tr>
            `;
        });

        // 결과를 HTML 형식으로 포맷하여 생성
        contents = `
        <div>
            <p>해당 지표는 부동산 가격의 변동을 제외하였습니다.</p>
            <p>물가상승률은 공개된 통계 자료의 평균인 2.4%,</p>
            <p>임금 상승률은 공개된 통계 자료의 평균인 3.7%를 적용했습니다.</p>
            <div>
                <h2>아래는 당신이 일하기 시작한 첫 연도의 순이익을 계산한 것입니다.</h2>
            </div>
            <div id="plotly-chart">
            </div>
        </div>
        <div>
            <div>
                <h2>아래는 당신이 건물을 구매할 때까지의 과정을 나타낸 것입니다.</h2>
            </div>
            <div id="plotly-chart2"></div>
        </div>
        <div>
        ${avgPriceData.length > 0 ? `
            <div style="display:grid; grid-template-rows: auto auto auto">
                <div class="lastInfo" style="padding:0">
                    <p>${year}년 기준 ${gu}에서 ${areaRange} ${purpose}를 사려고 한다. 
                    <br>매년 연봉 ${template.formatKoreanCurrency(income)}으로 한달에 ${template.formatKoreanCurrency(annualExpenses)}씩 쓸때,</p>
                    <p>단 한번도 안짤리고 연속으로 일해야하는 년 수 과 평균 가격</p>
                    <h1>평균 가격: ${template.formatKoreanCurrency(avgPrice.toFixed(0))}</h1>
                    <h1>구매까지 소요되는 년 수: <span style="color:red;">${yearsRequired}</span>년</h1>
                </div>
                <div style="padding:0; display: flex; align-items: center; justify-content: center;">
                    <img id="picto" src="" alt="이미지">
                    <p id="pictoInfo" style="color:blue;">오류</p>
                </div>
            </div>
        ` : '<div><p>평균 가격 정보가 없습니다.</p></div>'}
        ${top5Data.length > 0 ? `
        <p>&nbsp;</p>
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
            <h3>최고가 5개 ${purpose} 가격 및 구매까지 소요되는 년 수</h3>
            <table style="margin: 0 auto;">
                <thead>
                    <tr>
                        <th>건물명</th>
                        <th>가격</th>
                        <th>소요년수</th>
                    </tr>
                </thead>
                <tbody>
                    ${top5Contents}
                </tbody>
            </table>
        </div>
        <p>&nbsp;</p>
        ` : '<div><p>최고가 5개 건물 정보가 없습니다.</p></div>'}
        </div>
        `;  
        console.log(contents); // 결과 출력
        
        js = `
        <script src="../js/5.js"></script>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script> // 수입, 지출, 순수익차트
            determinePicto(${yearsRequired});
            document.addEventListener("DOMContentLoaded", function(event) {
                // 수입, 지출, 순수익 계산
                const income = ${income};
                const expense = ${realannualExpenses};
                const netIncome = income - expense;
    
                var data = [
                    {
                        name: "수입+지출+자금", // 차트 이름
                        type: "waterfall", // 차트 유형
                        orientation: "v", // 차트 방향 (수직)
                        measure: [
                            "relative", // 상대값으로 시작
                            "relative", // 총합값으로 종료
                            "total" // 총합값으로 종료
                        ],
                        x: [
                            "수입", // x축 레이블
                            "지출", // x축 레이블
                            "자금" // x축 레이블
                        ],
                        textposition: "outside",
                        text: [
                            income + "만원", // 수입 값
                            -expense + "만원", // 지출 값 (수입에서 빼므로 음수로 표시)
                            netIncome + "만원"// 자금 값
                        ],          
                        y: [
                            income, // 수입 값
                            -expense, // 지출 값 (수입에서 빼므로 음수로 표시)
                            netIncome // 자금 값
                        ],
                        hovertemplate: '%{y}만원<extra></extra>', // <--- 여기에 hoverinfo 속성 추가
                        connector: {
                            line: {
                                color: "rgb(63, 63, 63)"
                            }
                        },
                    }
                ];
    
                var layout = {
                    title: {
                        text: "수입, 지출, 자금" // 차트 제목
                    },
                    xaxis: {
                        type: "category" // x축 타입
                    },
                    yaxis: {
                        type: "linear", // y축 타입
                        range: [0, Math.max(income, -expense, netIncome) * 1.2] // y축 범위 조정
                    },
                    autosize: true, // 차트 크기 자동 조정
                    showlegend: true // 범례 표시 여부
                };
    
                Plotly.newPlot('plotly-chart', data, layout); // 차트 생성
            });
        </script>
    
    
        <script>
        document.addEventListener("DOMContentLoaded", function(event) {
            // 수입, 지출, 순수익 계산 및 초기 설정
            let currentIncome = ${income}; // 현재 수입
            let expense = ${realannualExpenses}; // 월 지출을 연간 지출로 변환
            let netIncome = currentIncome - expense; // 순수익
            let target = ${avgPrice}; // 목표 가격
    
            // 상승률 고려 체크박스 상태 가져오기
            const rateIncrease = ${RrateIncrease}; // 수익률 상승률 고려 여부
            const considerExpenses = ${RconsiderExpenses}; // 지출 상승률 고려 여부
    
            // 반복 횟수 설정
            const repeatCount = ${answer}; // 필요한 연도 계산 결과 사용
            var xValues = [];
            var yValues = [];
            var textValues = [];
            var measures = [];
    
        // 반복해서 데이터 생성
            for (let i = 0; i < repeatCount; i++) {
                xValues.push(\`수입 \${i+1}\`);
                yValues.push(currentIncome);
                textValues.push(currentIncome.toFixed(0) + "만원");
                measures.push("relative");
    
                xValues.push(\`지출 \${i+1}\`);
                yValues.push(-expense);
                textValues.push((-expense).toFixed(0) + "만원");
                measures.push("relative");
    
                xValues.push(\`\${i+1}년\`);
                yValues.push(currentIncome-expense);
                textValues.push((currentIncome-expense).toFixed(0) + "만원");
                measures.push("total");
    
            
                // 수입과 지출에 상승률 적용
                if (rateIncrease) currentIncome *= 1.037; // 수입 상승률 적용
                if (considerExpenses) expense *= 1.024; // 지출 상승률 적용
    
            }
    
            var data = [{
                name: "수입+지출+순수익",
                type: "waterfall",
                orientation: "v",
                measure: measures,
                x: xValues,
                textposition: "outside",
                text: textValues,
                y: yValues,
                hovertemplate: '%{y:,.0f}만원<extra></extra>',
                connector: {
                    line: {
                        color: "rgb(63, 63, 63)"
                    }
                },
            }];
    
            var layout = {
                title: {
                    text: "구매까지 ${answer}년 반복  " // 차트 제목
                },
                xaxis: {
                    type: "category" // x축 타입
                },
                yaxis: {
                    title: '평균 거래 가격(만원)',
                    type: "linear", // y축 타입
                    range: [0,target+10000], // y축 범위 조정
                    tickformat: ',', // 천 단위마다 쉼표 추가
                    hoverformat: ',' // hover 시 천 단위마다 쉼표 추가
                },
                autosize: true, // 차트 크기 자동 조정
                showlegend: true // 범례 표시 여부
            };
    
            Plotly.newPlot('plotly-chart2', data, layout); // 차트 생성
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