module.exports = {
    make_page:function(css,search,contents,func){
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
                                        <div><a href="/1/1">가장 비싼/싼 건물</a></div>
                                        <div><a href="/1/2">면적대비 비싼/싼 건물</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">용도별 정보
                                    <div class="submenu">
                                        <div><a href="/2/1">연별 평균가격</a></div>
                                        <div><a href="/2/2">연별 거래량 수</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">월별 정보
                                    <div class="submenu">
                                        <div><a href="/3/1">월별 계약량</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">자치구,동별 정보
                                    <div class="submenu">
                                        <div><a href="/4/1">최다 거래량 자치구</a></div>
                                        <div><a href="/4/2">최대 평균가격 자치구</a></div>
                                        <div><a href="/4/3">최다 거래량 동</a></div>
                                        <div><a href="/4/4">최대 평균가격 동</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">집사는 시기 알아보기
                                    <div class="submenu">
                                        <div><a href="/5/1">이돈으로 몇년?</a></div>
                                        <div><a href="/5/2">이돈으로 뭘?</a></div>
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
                    <div></div>
                    <div class="search-inner">
                        ${search}
                    </div>
                    <div></div>
                </div>
                <div class="content">
                    <div></div>
                    <div class="content-inner">
                        ${contents}
                    </div>
                    <div></div>
                </div>
            </div>
            <script>
            document.querySelector('.BMDG').addEventListener('click', function() {
                window.location.href = '/';
            });
            ${func}
            </script>
        </body>
        </html>
        `;
    }
}
