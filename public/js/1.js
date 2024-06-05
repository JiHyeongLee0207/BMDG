function selectYear(event, year) {
    event.preventDefault(); // 기본 링크 동작을 막음

    showLoadingScreen();
    
    // 선택된 연도를 hidden input에 설정
    document.getElementById('selectedYear').value = year;
    
    // 버튼 텍스트를 선택된 연도로 변경
    document.getElementById('dropdownButton').innerText = year;

    // URL 쿼리 문자열을 변경
    const url = new URL(window.location);
    url.searchParams.set('year', year);
    window.history.pushState({}, '', url);

    // 폼을 제출하여 페이지 갱신
    document.getElementById('yearForm').submit();
}