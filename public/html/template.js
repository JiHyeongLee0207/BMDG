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
                                <div class="menu-item">1
                                    <div class="submenu">
                                        <div><a href="/1/1">1-1</a></div>
                                        <div><a href="/1/2">1-2</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">2
                                    <div class="submenu">
                                        <div><a href="/2/1">2-1</a></div>
                                        <div><a href="/2/2">2-2</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">3
                                    <div class="submenu">
                                        <div><a href="/3/1">3-1</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">4
                                    <div class="submenu">
                                        <div><a href="/4/1">4-1</a></div>
                                        <div><a href="/4/2">4-2</a></div>
                                        <div><a href="/4/3">4-3</a></div>
                                        <div><a href="/4/4">4-4</a></div>
                                    </div>
                                </div>
                                <div class="menu-item">5
                                    <div class="submenu">
                                        <div><a href="/5/1">5-1</a></div>
                                        <div><a href="/5/2">5-2</a></div>
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
