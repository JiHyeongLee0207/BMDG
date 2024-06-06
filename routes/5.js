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
                    <input type="number" name="income" placeholder="연간 수익 (만원)(세후)">
                </div>
                <div>
                    <input type="checkbox" name="rateIncrease" checked>
                    <p>수익률 상승률 고려<p>
                </div>
                <div>
                    <input type="number" name="annualExpenses" placeholder="연간 지출 (만원)">
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

    let yearsRequired = 0;
    let currentSavings = 0;
    let currentIncome = income;

    while (currentSavings < avgPrice) {
        currentSavings += currentIncome;
        if (considerExpenses) currentSavings -= annualExpenses;
        if (rateIncrease) currentIncome *= 1.03;
        yearsRequired++;
    }

    //쿼리13 이돈으로 몇년?(최고가)
    const top5Data = await collection.aggregate([
        matchStage,
        {
            $sort: { "물건금액(만원)": -1 }
        },
        {
            $limit: 5
        }
    ]).toArray();

    let top5Contents = '';
    top5Data.forEach(building => {
        let yearsRequired2 = 0;
        let currentSavings2 = 0;
        let currentIncome2 = income;

        while (currentSavings2 < building["물건금액(만원)"]) {
            currentSavings2 += currentIncome2;
            if (considerExpenses) currentSavings2 -= annualExpenses;
            if (rateIncrease) currentIncome2 *= 1.03;
            yearsRequired2++;
        }

        top5Contents += `
            <tr>
                <td>${building.건물명}</td>
                <td>${template.formatKoreanCurrency(building["물건금액(만원)"].toFixed(0))}</td>
                <td>${yearsRequired2}년</td>
            </tr>
        `;
    });

    

    const contents = `
    <div>
    ${avgPriceData.length > 0 ? `
        <div>
            <h1>${year}년기준 ${gu}에서 ${purpose}를 사려고 할 때, 매년 ${template.formatKoreanCurrency(income)}의 수익으로 ${annualExpenses}만원를 소비할때</h1>
            <h2> ${purpose} 평균 가격 및 구매까지 소요되는 년 수</h2>
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

    console.log(contents);


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
                    <input class="dropbtn dropbtn2" type="number" name="income" placeholder="연간 수익 (만원)(세후)">
                </div>
                <div>
                    <input type="checkbox" name="rateIncrease" checked>
                    <p>수익률 상승률 고려<p>
                </div>
                <div>
                    <input class="dropbtn dropbtn2" type="number" name="annualExpenses" placeholder="연간 지출 (만원)">
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

    year = parseInt(year);
    income = parseInt(income);
    annualExpenses = parseInt(annualExpenses);
    years = parseInt(years);

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

    let totalSavings = 0;
    let currentIncome = income;

    for (let i = 0; i < years; i++) {
        totalSavings += currentIncome;
        if (considerExpenses) totalSavings -= annualExpenses;
        if (rateIncrease) currentIncome *= 1.03;
    }


    const affordableBuildings = await collection.aggregate([
        matchStage,
        {
            $match: {
                "물건금액(만원)": { $lte: totalSavings }
            }
        },
        {
            $sort: { "물건금액(만원)": -1 }
        }
    ]).toArray();

    let affordableContents = '';
    affordableBuildings.forEach(building => {
        affordableContents += `
            <tr>
                <td>${building.건물명}</td>
                <td>${template.formatKoreanCurrency(building["물건금액(만원)"].toFixed(0))}</td>
            </tr>

            
        `;
    });
    console.log("생성한  affordableContents: ",affordableContents);

    const contents = affordableBuildings.length > 0 ? `
        <div>
            <h2>${years}년 내에 구매 가능한 건물 목록</h2>
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
    ` : '<div><p>결과가 없습니다.</p></div>';

    const js = `
    <script src="../js/5.js"></script>
    `;
    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});

module.exports = router;