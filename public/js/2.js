function handlePurposeSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    document.getElementById('purpose').value = data;
    document.getElementById('purposeDropdownButton').innerText = data;

    const url = new URL(window.location);
    url.searchParams.set('purpose', data);
    window.history.pushState({}, '', url);
}

function handleFromYearSelect(event, year) {
    event.preventDefault(); // 기본 링크 동작을 막음

    var toYearDropdown = document.getElementById('toYearDropdown');
    toYearDropdown.style.display = 'inline-block';

    var fromYearDropdownButton = document.getElementById('fromYearDropdownButton');
    fromYearDropdownButton.textContent = year;
    document.getElementById('fromYear').value = year;

    var toYearDropdownContent = document.getElementById('toYearDropdownContent');
    toYearDropdownContent.innerHTML = ''; // 기존 옵션 초기화
    for (let toYear = year; toYear <= 2023; toYear++) {
        let option = `<a href="#" onclick="handleToYearSelect(event, ${toYear})">${toYear}</a>`;
        toYearDropdownContent.innerHTML += option;
    }

    const url = new URL(window.location);
    url.searchParams.set('fromYear', year);
    window.history.pushState({}, '', url);
}

function handleToYearSelect(event, year) {
    event.preventDefault(); // 기본 링크 동작을 막음

    var toYearDropdown = document.getElementById('formSubmit');
    toYearDropdown.style.display = 'inline-block';

    var toYearDropdownButton = document.getElementById('toYearDropdownButton');
    toYearDropdownButton.textContent = year;
    document.getElementById('toYear').value = year;
}

function handleSubmit(event, purpose, fromYear, toYear) {
    event.preventDefault();

    if(purpose === undefined ||
        fromYear === undefined ||
        toYear === undefined
    ) return;

    showLoadingScreen();

    document.getElementById('purposeDropdownButton').innerText = `${purpose}`;
    document.getElementById('fromYearDropdownButton').innerText = fromYear;
    document.getElementById('toYearDropdownButton').innerText = toYear;

    document.getElementById('yearForm').submit();
}

