const express = require('express');
const app = express();

// 미들웨어 추가
app.use(express.static('public')); // 정적 파일 제공
const allRouter = require('./routes/page.js');
app.use('/', allRouter);

var port = 3000
app.listen(port, () => {
  console.log(`포트 번호: ${port}`)
})