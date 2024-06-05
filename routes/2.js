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

router.get('/1', async (req, res, next) => {
  const MONGO_URI = process.env.MONGO_URI;
  const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = await connectDB(client);
  const collection = await connectBMDG(db);

  let purpose = req.querypurpose;
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
  <link rel="stylesheet" href="../css/2_1.css">
  `;
  const search = `
  <form id="yearForm" method="get">
      <div class="dropdown">
          <button type="button" class="dropbtn" id="purposeDropdownButton">${purposeBoxName}</button>
          <div class="dropdown-content">
              ${["아파트", "오피스텔", "연립다세대", "단독다가구"].map(purpose => 
                  `<a href="#" onclick="purpose(event, '${purpose}')">${purpose}</a>` // 여기를 수정
              ).join('')}
          </div>
      </div>
      <div class="dropdown">
          <button type="button" class="dropbtn"  id="fromYearDropdownButton">${fromYearBoxName}</button>
          <div class="dropdown-content">
              ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => 
                  `<a href="#" onclick="fromYear(event, ${year})">${year}</a>`
              ).join('')}
          </div>
      </div>
      <div class="dropdown">
          <button type="button" class="dropbtn"  id="toYearDropdownButton">${toYearBoxName}</button>
          <div class="dropdown-content">
              ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => 
                  `<a href="#" onclick="toYear(event, ${year})">${year}</a>`
              ).join('')}
          </div>
      </div>
      <div class="submit" style="display:inline-block">
          <button type="button" class="submitbtn" id="submit">조회</button>
      </div>
      <input type="hidden" name="purpose" id="purpose">
      <input type="hidden" name="fromYear" id="fromYear">
      <input type="hidden" name="toYear" id="toYear">
  </form>
  `;
  
  const contents = `
  
  `;

  const func = `
  function purpose(event, data) {
      event.preventDefault(); // 기본 링크 동작을 막음

      // 선택된 연도를 hidden input에 설정
      document.getElementById('purpose').value = data;
      
      // 버튼 텍스트를 선택된 연도로 변경
      document.getElementById('purposeDropdownButton').innerText = data;

      // URL 쿼리 문자열을 변경
      const url = new URL(window.location);
      url.searchParams.set('data', data);
      window.history.pushState({}, '', url);
  }

  function fromYear(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    // 선택된 연도를 hidden input에 설정
    document.getElementById('fromYear').value = data;
    
    // 버튼 텍스트를 선택된 연도로 변경
    document.getElementById('fromYearDropdownButton').innerText = data;

    // URL 쿼리 문자열을 변경
    const url = new URL(window.location);
    url.searchParams.set('data', data);
    window.history.pushState({}, '', url);
  }

  function toYear(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    // 선택된 연도를 hidden input에 설정
    document.getElementById('toYear').value = data;
    
    // 버튼 텍스트를 선택된 연도로 변경
    document.getElementById('toYearDropdownButton').innerText = data;

    // URL 쿼리 문자열을 변경
    const url = new URL(window.location);
    url.searchParams.set('data', data);
    window.history.pushState({}, '', url);
  }

  function submit(event){
    event.preventDefault();

    showLoadingScreen();

    document.getElementById('yearForm').submit();
  }
  `;

  closeConnection(client);
  res.send(template.make_page(css, search, contents, func));
});

router.get('/2', async (req, res, next) => {
  const MONGO_URI = process.env.MONGO_URI;
  const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = await connectDB(client);
  const collection = await connectBMDG(db);

  let purpose = req.querypurpose;
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
  <link rel="stylesheet" href="../css/2_1.css">
  `;
  const search = `
  <form id="yearForm" method="get">
      <div class="dropdown">
          <button type="button" class="dropbtn" id="purposeDropdownButton">${purposeBoxName}</button>
          <div class="dropdown-content">
              ${["아파트", "오피스텔", "연립다세대", "단독다가구"].map(purpose => 
                  `<a href="#" onclick="purpose(event, '${purpose}')">${purpose}</a>` // 여기를 수정
              ).join('')}
          </div>
      </div>
      <div class="dropdown">
          <button type="button" class="dropbtn"  id="fromYearDropdownButton">${fromYearBoxName}</button>
          <div class="dropdown-content">
              ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => 
                  `<a href="#" onclick="fromYear(event, ${year})">${year}</a>`
              ).join('')}
          </div>
      </div>
      <div class="dropdown">
          <button type="button" class="dropbtn"  id="toYearDropdownButton">${toYearBoxName}</button>
          <div class="dropdown-content">
              ${[2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(year => 
                  `<a href="#" onclick="toYear(event, ${year})">${year}</a>`
              ).join('')}
          </div>
      </div>
      <div class="submit" style="display:inline-block">
          <button type="button" class="submitbtn" id="submit">조회</button>
      </div>
      <input type="hidden" name="purpose" id="purpose">
      <input type="hidden" name="fromYear" id="fromYear">
      <input type="hidden" name="toYear" id="toYear">
  </form>
  `;
  
  const contents = `
  
  `;

  const func = `
  function purpose(event, data) {
      event.preventDefault(); // 기본 링크 동작을 막음

      // 선택된 연도를 hidden input에 설정
      document.getElementById('purpose').value = data;
      
      // 버튼 텍스트를 선택된 연도로 변경
      document.getElementById('purposeDropdownButton').innerText = data;

      // URL 쿼리 문자열을 변경
      const url = new URL(window.location);
      url.searchParams.set('data', data);
      window.history.pushState({}, '', url);
  }

  function fromYear(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    // 선택된 연도를 hidden input에 설정
    document.getElementById('fromYear').value = data;
    
    // 버튼 텍스트를 선택된 연도로 변경
    document.getElementById('fromYearDropdownButton').innerText = data;

    // URL 쿼리 문자열을 변경
    const url = new URL(window.location);
    url.searchParams.set('data', data);
    window.history.pushState({}, '', url);
  }

  function toYear(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    // 선택된 연도를 hidden input에 설정
    document.getElementById('toYear').value = data;
    
    // 버튼 텍스트를 선택된 연도로 변경
    document.getElementById('toYearDropdownButton').innerText = data;

    // URL 쿼리 문자열을 변경
    const url = new URL(window.location);
    url.searchParams.set('data', data);
    window.history.pushState({}, '', url);
  }

  function submit(event){
    event.preventDefault();

    showLoadingScreen();

    document.getElementById('yearForm').submit();
  }
  `;

  closeConnection(client);
  res.send(template.make_page(css, search, contents, func));
});

module.exports = router;
