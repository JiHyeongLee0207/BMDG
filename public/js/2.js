function handlePurposeSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    document.getElementById('purpose').value = data;
    document.getElementById('purposeDropdownButton').innerText = data;

    const url = new URL(window.location);
    url.searchParams.set('purpose', data);
    window.history.pushState({}, '', url);
}

function handleFromYearSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    var fromYearDropdownButton = document.getElementById('fromYearDropdownButton');
    fromYearDropdownButton.textContent = data;
    document.getElementById('fromYear').value = data;

    var toYearDropdownContent = document.getElementById('toYearDropdownContent');
    toYearDropdownContent.innerHTML = ''; // 기존 옵션 초기화
    for (let toYear = 2023; toYear >= data; toYear--) {
        let option = `<a href="#" onclick="handleToYearSelect(event, ${toYear})">${toYear}</a>`;
        toYearDropdownContent.innerHTML += option;
    }

    const url = new URL(window.location);
    url.searchParams.set('fromYear', data);
    window.history.pushState({}, '', url);
}

function handleToYearSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    var toYearDropdownButton = document.getElementById('toYearDropdownButton');
    toYearDropdownButton.textContent = data;
    document.getElementById('toYear').value = data;
}

function handleSubmit(event) {
    event.preventDefault();
    showLoadingScreen();
    document.getElementById('yearForm').submit();
}

