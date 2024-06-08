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
    
def duplicatedDataElimination(db):
    collection = db["budongsan"]
    pipeline = [
        {
            '$group': {
                '_id': {
                    '연도': '$연도',  # 실제 데이터의 필드로 변경
                    '자치구명': '$자치구명',
                    '법정동명': '$법정동명',
                    '건물명':'$건물명',
                    '계약일':'$계약일',
                    '물건금액':'$물건금액',
                    '건물면적':'$건물면적',
                    '건물용도':'$건물용도'
                    # 모든 필드를 여기에 추가
                },
                'dups': {'$addToSet': '$_id'},
                'count': {'$sum': 1}
            }
        },
        {
            '$match': {
                'count': {'$gt': 1}
            }
        }
    ]
    duplicates = collection.aggregate(pipeline)

    # 중복 데이터 제거
    for doc in duplicates:
        doc['dups'].pop(0)  # 첫 번째 요소를 제외하고 나머지 중복 요소를 제거
        collection.delete_many({'_id': {'$in': doc['dups']}})

# 메인 실행 블록
if __name__ == "__main__":
    db = connect_db()
    nullDataElimination(db)
    duplicatedDataElimination(db)

# 191개 데이터 제거 완료 + 
# 8개의 필드값이 중복되는 데이터 368,116개 제거 ->  2178078