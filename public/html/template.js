module.exports = {
    make_page:function(css,search,contents,js){
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Homepage</title>
            <link rel="stylesheet" href="../css/page.css">
            ${css}
        </head>
        <body>
            <div class="container">
                <div class="top">
                    <div></div>
                    <div class="header">
                        <div class="header-name">
                            <button class="BMDG"><b>BMDG</b></button>
                        </div>
                        <div class="header-navbar">
                            <div class="menu">
                                <div class="menu-item">건물 정보
                                    <div class="submenu">
                                        <div><a href="/1/1" onclick="showLoadingScreen();">가장 비싼/싼 건물</a></div>
                                        <div><a href="/1/2" onclick="showLoadingScreen();">면적대비 비싼/싼 건물</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">용도별 정보
                                    <div class="submenu">
                                        <div><a href="/2/1" onclick="showLoadingScreen();">연별 평균가격</a></div>
                                        <div><a href="/2/2" onclick="showLoadingScreen();">연별 거래량 수</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">월별 정보
                                    <div class="submenu">
                                        <div><a href="/3/1" onclick="showLoadingScreen();">월별 계약량</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">자치구,동별 정보
                                    <div class="submenu">
                                        <div><a href="/4/1" onclick="showLoadingScreen();">최다 거래량 자치구</a></div>
                                        <div><a href="/4/2" onclick="showLoadingScreen();">최대 평균가격 자치구</a></div>
                                        <div><a href="/4/3" onclick="showLoadingScreen();">최다 거래량 동</a></div>
                                        <div><a href="/4/4" onclick="showLoadingScreen();">최대 평균가격 동</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">집사는 시기 알아보기
                                    <div class="submenu">
                                        <div><a href="/5/1" onclick="showLoadingScreen();">이돈으로 몇년?</a></div>
                                        <div><a href="/5/2" onclick="showLoadingScreen();">이돈으로 몇년?(최고가)</a></div>
                                        <div><a href="/5/3" onclick="showLoadingScreen();">이돈으로 뭘?</a></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div></div>
                </div>
                <div id="line">
                    <img src="../images/line.png" alt="">
                </div>
                <div class="search">
                    <div class="search-inner">
                        ${search}
                    </div>
                </div>
                <div class="content">
                    <div></div>
                    <div class="content-inner">
                        ${contents}
                    </div>
                    <div></div>
                </div>
            </div>

            <div id="loadingScreen" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(255,255,255,0.6); z-index:1000;">
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
                    <h1>Now Loading . . .</h1>
                </div>
            </div>

            <script>
            document.querySelector('.BMDG').addEventListener('click', function() {
                window.location.href = '/';
            });
            
            function showLoadingScreen() {
                document.getElementById('loadingScreen').style.display = 'block';
            }
            
            function hideLoadingScreen() {
                document.getElementById('loadingScreen').style.display = 'none';
            }
            
            // 페이지가 로드될 때마다 loadingScreen을 숨기는 로직 추가
            window.addEventListener('pageshow', function(event) {
                hideLoadingScreen();
            });
            </script>
            ${js}
        </body>
        </html>
        `;
    }
}
