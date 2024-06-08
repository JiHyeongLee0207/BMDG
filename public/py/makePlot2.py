import pymongo
import pandas as pd
import json
import plotly.express as px
from urllib.request import urlopen
import os

# MongoDB 연결 및 데이터베이스 반환
def connect_db():
    client = pymongo.MongoClient("mongodb://localhost:27017")
    db = client["BMDG"]
    return db

# MongoDB에서 부동산 데이터 가져오기, year와 purpose를 인자로 추가
def get_real_estate_data(db, year, purpose):
    collection = db["budongsan"]
    # 연도와 용도에 맞는 데이터 검색
    data = list(collection.find({"연도": year, "건물용도": purpose}, {'_id': 0, '자치구명': 1, '물건금액(만원)': 1}))
    return data

# 데이터 시각화, 파일명에 year와 purpose를 반영하여 변경
def visualize_data(data, year, purpose):
    # 데이터프레임 생성
    df = pd.DataFrame(data)
    
    # 결손값 제거
    df = df.dropna(subset=['물건금액(만원)'])
    
    # 자치구명 기준으로 물건금액의 평균 계산
    avg_prices = df.groupby('자치구명')['물건금액(만원)'].mean().reset_index()
    avg_prices.columns = ['자치구명', '평균물건금액']
    
    # 평균물건금액을 정수로 변환하여 소수점 제거
    avg_prices['평균물건금액'] = avg_prices['평균물건금액'].astype(int)
    
    # 억 단위로 변환
    avg_prices['평균물건금액억'] = avg_prices['평균물건금액'] / 10000
    
    # customdata를 추가하여 억 단위와 만 단위로 변환된 값을 포함
    avg_prices['억단위'] = avg_prices['평균물건금액'] // 10000
    avg_prices['만단위'] = avg_prices['평균물건금액'] % 10000
    
    # GeoJSON 파일 로드
    with urlopen('https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json') as response:
        seoul_geo = json.load(response)
    
    # 시각화
    fig = px.choropleth_mapbox(avg_prices, geojson=seoul_geo, locations='자치구명', color='평균물건금액억',
                               featureidkey="properties.name",
                               color_continuous_scale="Viridis",
                               mapbox_style="carto-positron",
                               zoom=10, center={"lat": 37.5651, "lon": 126.98955},
                               opacity=0.5,
                               labels={'평균물건금액억': '평균 물건 금액 (억 원)'}
                              )
    
    # customdata를 설정하여 억 단위와 만 단위를 전달
    fig.update_traces(customdata=avg_prices[['억단위', '만단위']],
                      hovertemplate='<b>%{location}</b><br>평균 물건 금액: %{customdata[0]}억 %{customdata[1]}만원')
    
    # 색상 범위의 최소값을 데이터의 최저값으로 설정하고, colorbar의 tickformat을 설정하여 억 단위로 표시
    min_value = avg_prices['평균물건금액억'].min()
    fig.update_layout(coloraxis_colorbar=dict(tickformat=".1f"),
                      coloraxis=dict(cmin=min_value))
    
    fig.update_layout(margin={"r": 0, "t": 0, "l": 0, "b": 0})
    
    # 디렉토리 확인 및 생성
    output_dir = '../cacheData2'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    output_file = os.path.join(output_dir, f"{year}_{purpose}.html")
    fig.write_html(output_file)
    print(output_file)

# 메인 실행 블록
if __name__ == "__main__":
    db = connect_db()
    years = range(2006, 2024)  # 2006년부터 2023년까지
    purposes = ["아파트", "오피스텔", "연립다세대", "단독다가구"]
    
    for year in years:
        for purpose in purposes:
            real_estate_data = get_real_estate_data(db, year, purpose)
            if len(real_estate_data) > 0:  # 데이터가 있을 경우에만 시각화
                visualize_data(real_estate_data, year, purpose)
