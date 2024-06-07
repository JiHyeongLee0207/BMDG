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
    const contents = `
    <div>
    ${avgPriceData.length > 0 ? `
        <div>
            <h1>${year}년 기준 ${gu}에서 ${areaRange} ${purpose}를 사려고 한다, 
            <br>매년 연봉 ${template.formatKoreanCurrency(income)}으로 한달에 ${template.formatKoreanCurrency(annualExpenses)}씩 쓸때</h1>
            <h2>단 한번도 안짤리고 연속으로 일해야하는 년 수 과 평균 가격</h2>
            <p>평균 가격: ${template.formatKoreanCurrency(avgPrice.toFixed(0))}</p>
            <p>구매까지 소요되는 년 수: ${yearsRequired}년</p>
        </div>
    ` : '<div><p>평균 가격 정보가 없습니다.</p></div>'}
    ${top5Data.length > 0 ? `
        <div>
            <h2>최고가 5개 ${purpose} 가격 및 구매까지 소요되는 년 수</h2>
            <table>
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
    ` : '<div><p>최고가 5개 건물 정보가 없습니다.</p></div>'}
    </div>
    `;
    
    console.log(contents); // 결과 출력
    

    const js = `
    <script src="../js/5.js"></script>
    `;

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

    for (let i = 0; i < years; i++) {
        totalSavings += currentIncome;
        totalSavings -= expense;
        if (rateIncrease) currentIncome *= 1.037; // 수입 상승률 적용 (3.7% 상승)
        if (considerExpenses) expense *= 1.024; // 지출 상승률 적용 (2.4% 상승)
    }

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
    const contents = `
    <div>
    ${affordableBuildings.length > 0 ? `
        <div>
            <h1>${year}년 기준 ${gu}에서 ${areaRange} ${purpose}를 사려고 한다 
            <br>매년 연봉 ${template.formatKoreanCurrency(income)}으로 한달에 ${template.formatKoreanCurrency(annualExpenses)}씩 쓸때</h1>
            <h2>단 한번도 안짤리고 연속으로 ${years}년 만큼 일하면 살수있는 ${purpose}와 가격</h2>
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
    ` : `'<div><h1> ${year}년 기준 ${gu}에서 ${areaRange} ${purpose}를 사려고 할때, <br>매년 연봉 ${template.formatKoreanCurrency(income)}으로 한달에 ${template.formatKoreanCurrency(annualExpenses)}씩 쓸때</h1><h2>단 한번도 안짤리고 연속으로 ${years}년 만큼 일해도 살수있는 ${purpose}(이)가 없습니다.</h2></div>'`}
    </div>
    `;

    const js = `
    <script src="../js/5.js"></script>
    `;
    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});

module.exports = router;