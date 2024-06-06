function handleGuSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    document.getElementById('gu').value = data;
    document.getElementById('guDropdownButton').innerText = data;

    const url = new URL(window.location);
    url.searchParams.set('gu', data);
    window.history.pushState({}, '', url);
}

function handleDongSelect(event, data) {
    event.preventDefault(); // 기본 링크 동작을 막음

    document.getElementById('dong').value = data;
    document.getElementById('dongDropdownButton').innerText = data;

    const url = new URL(window.location);
    url.searchParams.set('dong', data);
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

function handleSubmit(event) {
    event.preventDefault();
    showLoadingScreen();
    document.getElementById('yearForm').submit();
}