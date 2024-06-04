const { MongoClient } = require("mongodb");
require("dotenv").config();

async function connectDB(client) {
  let db;
  if (!db) {
    await client.connect();
    db = client.db('BMDG');
    console.log("MongoDB 연결 성공");
  }
  return db;
}

async function closeConnection(client) {
  await client.close();
  console.log("MongoDB 연결 종료");
}

async function connectBMDG(db) {
  return db.collection('budongsan');
}

module.exports = {
  MongoClient,
  connectDB,
  connectBMDG,
  closeConnection
};
