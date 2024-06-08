import sys
import os
import pymongo
import pandas as pd
import json
import plotly.express as px
from urllib.request import urlopen

# MongoDB 연결 및 데이터베이스 반환
def connect_db():
    client = pymongo.MongoClient("mongodb://localhost:27017")
    db = client["BMDG"]
    return db

# MongoDB에서 부동산 데이터 가져오기
def get_real_estate_data(db, year, purpose):
    collection = db["budongsan"]
    query = {"연도": int(year), "건물용도": purpose}
    data = list(collection.find(query, {'_id': 0, '자치구명': 1}))
    return data

# 데이터 시각화
def visualize_data(data, year, purpose):
    # 데이터프레임 생성
    df = pd.DataFrame(data)
    
    if df.empty:
        print(f"No data found for year: {year} and purpose: {purpose}")
        return
    
    # 자치구명 기준으로 거래 횟수 집계
    transaction_counts = df['자치구명'].value_counts().reset_index()
    transaction_counts.columns = ['자치구명', '거래횟수']
    
    # GeoJSON 파일 로드
    with urlopen('https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json') as response:
        seoul_geo = json.load(response)
    
    # 시각화
    fig = px.choropleth_mapbox(transaction_counts, geojson=seoul_geo, locations='자치구명', color='거래횟수',
                               featureidkey="properties.name",
                               color_continuous_scale="Viridis",
                               mapbox_style="carto-positron",
                               zoom=10, center={"lat": 37.5651, "lon": 126.98955},
                               opacity=0.5,
                               labels={'거래횟수':'거래 횟수'}
                              )
    fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
    
    # 디렉토리 확인 및 생성
    output_dir = '../cacheData'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    output_file = os.path.join(output_dir, f"{year}_{purpose}.html")
    fig.write_html(output_file)
    print(output_file)
# 메인 실행 블록
if __name__ == "__main__":
    db = connect_db()
    
    years = range(2006, 2024)
    purposes = ["아파트", "오피스텔", "연립다세대", "단독다가구"]
    
    for year in years:
        for purpose in purposes:
            real_estate_data = get_real_estate_data(db, year, purpose)
            visualize_data(real_estate_data, year, purpose)
