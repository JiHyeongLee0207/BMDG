function selectYear(event, year) {
    event.preventDefault();
    document.getElementById('selectedYear').value = year;

    const url = new URL(window.location);
    url.searchParams.set('year', year);
    window.history.pushState({}, '', url);

    showLoadingScreen();
    document.getElementById('yearForm').submit();
}