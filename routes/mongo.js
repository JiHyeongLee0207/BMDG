const express = require('express');
const router = express.Router();

// MongoDB 연결 설정
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017'; // 로컬 MongoDB 주소

// GET /api/data 엔드포인트 정의
router.get('/data', async (req, res) => {
    let client; // MongoDB 클라이언트 선언

    try {
        // MongoDB 연결
        client = new MongoClient(uri);
        await client.connect();

        // 데이터베이스 및 컬렉션 선택
        const database = client.db('mydatabase');
        const collection = database.collection('mycollection');

        // 데이터 조회
        const result = await collection.find({}).toArray();

        // 결과 전송
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 에러" });
    } finally {
        // 연결 종료
        if (client) {
            client.close();
        }
    }
});

module.exports = router;
