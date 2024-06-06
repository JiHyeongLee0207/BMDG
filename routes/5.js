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


// Helper function
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


// 쿼리 12 이돈으로 몇년?: -----------------------------------------------------------------------------------------------------------------------
router.get('/1', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);

    let { year, purpose, jachigu, income, areaRange, rateIncrease, considerExpenses, annualExpenses } = req.query;

    let selectedYear = req.query.year;
    console.log("받아온 쿼리 파라미터: ",selectedYear);
    if (!Number.isInteger(parseInt(selectedYear))) {
        selectedYear = parseInt(selectedYear);
        console.log("Converted selectedYear to Number:", selectedYear); // 변환된 selectedYear 값 로깅
    }
    purpose= "아파트";
    jachigu= "강남구";
    income= 5000, // 연봉 5000만원
    areaRange= '32평~44평';
    rateIncrease= true;
    considerExpenses= true;
    annualExpenses= 1000; // 연간 지출액 1000만원
    //years= 10 ;


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

    year=selectedYear;
    year = parseInt(year);
    income = parseInt(income);
    rateIncrease = rateIncrease === 'true';
    considerExpenses = considerExpenses === 'true';
    annualExpenses = parseInt(annualExpenses) || 0;

    const matchStage = {
        $match: {
            연도: year,
            건물용도: purpose,
            자치구명: jachigu,
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

    const contents = `
        <div>
            <h2>평균 가격 및 구매까지 소요되는 년 수</h2>
            <p>평균 가격: ${formatKoreanCurrency(avgPrice.toFixed(0))}</p>
            <p>구매까지 소요되는 년 수: ${yearsRequired}년</p>
        </div>
    `;

    console.log(contents);


    const js = `
    <script src="../js/13.js"></script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});



// Query 13: 이돈으로 몇년? (최고가) -----------------------------------------------------------------------------------------------------------------------
router.get('/2', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);

    let { year, purpose, jachigu, income, areaRange, rateIncrease, considerExpenses, annualExpenses } = req.query;
    purpose= "아파트";
    jachigu= "강남구";
    income= 5000, // 연봉 5000만원
    areaRange= '32평~44평';
    rateIncrease= true;
    considerExpenses= true;
    annualExpenses= 1000; // 연간 지출액 1000만원
    //years= 10 ;
    

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
    
    year = parseInt(year);
    console.log("받아온 쿼리 년도: ",year);
    income = parseInt(income);
    rateIncrease = rateIncrease === 'true';
    considerExpenses = considerExpenses === 'true';
    annualExpenses = parseInt(annualExpenses) || 0;

    const matchStage = {
        $match: {
            연도: year,
            건물용도: purpose,
            자치구명: jachigu,
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
        let yearsRequired = 0;
        let currentSavings = 0;
        let currentIncome = income;

        while (currentSavings < building["물건금액(만원)"]) {
            currentSavings += currentIncome;
            if (considerExpenses) currentSavings -= annualExpenses;
            if (rateIncrease) currentIncome *= 1.03;
            yearsRequired++;
        }

        top5Contents += `
            <tr>
                <td>${building.건물명}</td>
                <td>${formatKoreanCurrency(building["물건금액(만원)"].toFixed(0))}</td>
                <td>${yearsRequired}년</td>
            </tr>
        `;
    });

    const contents = `
        <div>
            <h2>최고가 5개 건물 및 구매까지 소요되는 년 수</h2>
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
    `;

    console.log(contents);


    const js = `
    <script src="../js/13.js"></script>
    `;

    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});


// Query 14: 이돈으로 뭘? -----------------------------------------------------------------------------------------------------------------------
router.get('/3', async (req, res, next) => {
    const MONGO_URI = process.env.MONGO_URI;
    const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = await connectDB(client);
    const collection = await connectBMDG(db);

    let { year, purpose, jachigu, income, areaRange, rateIncrease, considerExpenses, annualExpenses } = req.query;


    purpose= "아파트";
    jachigu= "강남구";
    income= 5000, // 연봉 5000만원
    areaRange= '32평~44평';
    rateIncrease= true;
    considerExpenses= true;
    annualExpenses= 1000; // 연간 지출액 1000만원
    years= 10;

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

    year = parseInt(year);
    console.log("받아온 쿼리 년도: ",year);
    
    income = parseInt(income);
    rateIncrease = rateIncrease === 'true';
    considerExpenses = considerExpenses === 'true';
    annualExpenses = parseInt(annualExpenses) || 0;
    years = parseInt(years);

    const matchStage = {
        $match: {
            연도: year,
            건물용도: purpose,
            자치구명: jachigu,
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
            $sort: { "물건금액(만원)": 1 }
        }
    ]).toArray();

    let affordableContents = '';
    affordableBuildings.forEach(building => {
        affordableContents += `
            <tr>
                <td>${building.건물명}</td>
                <td>${formatKoreanCurrency(building["물건금액(만원)"].toFixed(0))}</td>
            </tr>

            
        `;
    });
    console.log("생성한  affordableContents: ",affordableContents);

    const contents = `
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
    `;

    const js = `
    <script src="../js/13.js"></script>
    `;
    closeConnection(client);
    res.send(template.make_page(css, search, contents, js));
});

module.exports = router;