function toggleView(sectionId) {
    const output = document.getElementById(sectionId);
    if (output.innerHTML.trim() === output.dataset.formatted.trim()) {
        output.textContent = output.dataset.json;
    } else {
        output.innerHTML = output.dataset.formatted;
    }
}

function toggleWeatherView() {
    toggleView('output');
}

function toggleStockView() {
    toggleView('stocks-output');
}

function toggleMarineView() {
    toggleView('marine-output');
}
