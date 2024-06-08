import pymongo

# MongoDB 연결 및 데이터베이스 반환
def connect_db():
    client = pymongo.MongoClient("mongodb://localhost:27017")
    db = client["BMDG"]
    return db

# Field: "물건금액(만원)"이 비어있는 값 제거
def nullDataElimination(db):
    collection = db["budongsan"]
    collection.delete_many({ "물건금액(만원)": { '$exists': False }})
    collection.delete_many({ "물건금액(만원)": None })
    collection.delete_many({ "물건금액(만원)": '' })

# 메인 실행 블록
if __name__ == "__main__":
    db = connect_db()
    nullDataElimination(db)

# 191개 데이터 제거 완료