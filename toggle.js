function toggleView() {
    const output = document.getElementById('output');
    if (output.innerHTML.trim() === output.dataset.formatted.trim()) {
        output.textContent = output.dataset.json;
    } else {
        output.innerHTML = output.dataset.formatted;
    }
}

function toggleStockView() {
    const stockOutput = document.getElementById('stocks-output');
    console.log('Toggling view. Current innerHTML:', stockOutput.innerHTML.trim());
    console.log('Formatted data:', stockOutput.dataset.formatted);
    console.log('JSON data:', stockOutput.dataset.json);

    if (stockOutput.innerHTML.trim() === stockOutput.dataset.formatted.trim()) {
        stockOutput.innerHTML = `<pre>${stockOutput.dataset.json}</pre>`;
    } else {
        stockOutput.innerHTML = stockOutput.dataset.formatted;
    }
}
