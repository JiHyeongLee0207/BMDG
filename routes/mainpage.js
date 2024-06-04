const express = require('express');
const router = express.Router();
const fs = require('fs');
var template = require('../public/html/template.js');

router.get('/', (req, res, next) => {
    console.log('hi');
    const css = `
        <link rel="stylesheet" href="../css/main.css">
    `;
    const search = `
        <p style="text-align:center">위의 메뉴를 선택해주세요.</p>
    `;
    const contents = `
        <div>
            <h1>환영합니다!</h1>
            <br>
            <p>해당 사이트는 대학교 프로젝트를 거쳐 만들어졌습니다.</p>
            <p>서울 열린 데이터 광장 포털에 있는 공공데이터 중, 대한민국 서울시에서 실제로 거래된 부동산에 대한 정보를 모아서 그래프로 시각화한 페이지입니다.</p>
            <p>현재 사이트에 있는 정보보다 더 많은 정보를 추가되길 원하신다면 아래의 연락처를 확인하시고 이메일로 연락 바랍니다.</p>
        </div>
        <div class="team">
        <h1>웹페이지 창시자</h1>
            <div class="team-inner">
                <div>
                    <img src="./image/chan.png" alt="이찬">
                    <p>이찬</p>
                    <p><b>Email</b> ichan0318@naver.com</p>
                </div>
                <div>
                    <img src="./image/jihyeong.png" alt="이지형">
                    <p>이지형</p>
                    <p><b>Email</b> wptvkdldj@gmail.com</p>
                </div>
            </div>
        </div>
    `
    res.send(template.make_page(css,search,contents));
});

module.exports = router;