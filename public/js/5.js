function handleGuSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    document.getElementById('gu').value = data;
    document.getElementById('guDropdownButton').innerText = data;

    const url = new URL(window.location);
    url.searchParams.set('gu', data);
    window.history.pushState({}, '', url);
}

function handlePurposeSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    document.getElementById('purpose').value = data;
    document.getElementById('purposeDropdownButton').innerText = data;

    const url = new URL(window.location);
    url.searchParams.set('purpose', data);
    window.history.pushState({}, '', url);
}

function handleYearSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    var YearDropdownButton = document.getElementById('yearDropdownButton');
    YearDropdownButton.textContent = data;
    document.getElementById('year').value = data;

    const url = new URL(window.location);
    url.searchParams.set('year', data);
    window.history.pushState({}, '', url);
}

function handleAreaRangeSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    document.getElementById('areaRange').value = data;
    document.getElementById('areaRangeDropdownButton').innerText = data;

    const url = new URL(window.location);
    url.searchParams.set('areaRange', data);
    window.history.pushState({}, '', url);
}


function handleSubmit(event) {
    event.preventDefault();
    showLoadingScreen();
    document.getElementById('yearForm').submit();
}

function determinePicto(yearsRequired) { // 픽토그램 변경
    let pictoPath = '/image/';
    let pictoLetter = ``;
    if (yearsRequired <= 3) {
        pictoPath += '1.png';
        pictoLetter = ' 얼마 안 남은 것 같아요. 힘내세요!';
    } else if (yearsRequired <= 10) {
        pictoPath += '2.png';
        pictoLetter = ' 이 정도면 할 수 있을 것 같네요.';
    } else if (yearsRequired <= 20) {
        pictoPath += '3.png';
        pictoLetter = ' 살 집을 마련해주신 부모님의 대단함이 느껴집니다.';
    } else if (yearsRequired <= 30) {
        pictoPath += '4.png';
        pictoLetter = ' 당신의 청춘을 한 번 더 바치면 되겠네요.';
    } else if (yearsRequired <= 50) {
        pictoPath += '5.png';
        pictoLetter = ' 우리 현실과 합의해보는 것이 어떨까요?';
    } else if (yearsRequired <= 80) {
        pictoPath += '6.png';
        pictoLetter = ' 최소한 노년은 보낼 집이 있겠네요.';
    } else {
        pictoPath += '7.png';
        pictoLetter = ' 사후 세계에 집을 마련한다면 말리지는 않겠어요.';
    }
    document.getElementById('picto').src = pictoPath;
    document.getElementById('pictoInfo').innerText = pictoLetter;
};