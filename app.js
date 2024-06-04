const express = require('express');
const app = express();

// 미들웨어 추가
app.use(express.static('public')); // 정적 파일 제공
const homeRouter = require('./routes/mainpage.js');
app.use('/', homeRouter);
const Router1 = require('./routes/1.js');
app.use('/1', Router1);
const Router2 = require('./routes/2.js');
app.use('/2', Router2);
const Router3 = require('./routes/3.js');
app.use('/3', Router3);
const Router4 = require('./routes/4.js');
app.use('/4', Router4);
const Router5 = require('./routes/5.js');
app.use('/5', Router5);

app.use((request, response, next) => {
  response.status(404).send("404 not found");
});

app.use((err, request, response, next) => {
  console.error(err.stack);
  response.status(500).send("Something broke!");
});

var port = 3000
app.listen(port, () => {
  console.log(`포트 번호: ${port}`)
})