const alphaVantageApiKey = 'your_alpha_vantage_api_key';

document.addEventListener('DOMContentLoaded', loadStocks);

function addStock() {
    const stockInput = document.createElement('div');
    stockInput.classList.add('stock-input');
    stockInput.innerHTML = `
        <input type="text" placeholder="Enter Stock Symbol" class="stock-symbol" oninput="saveStocks()">
        <button onclick="removeStock(this)">Remove</button>
    `;
    document.getElementById('stocks-input').appendChild(stockInput);
    saveStocks();
}

function removeStock(button) {
    button.parentElement.remove();
    saveStocks();
}

function saveStocks() {
    const stockSymbols = Array.from(document.getElementsByClassName('stock-symbol')).map(input => input.value);
    localStorage.setItem('stocks', JSON.stringify(stockSymbols));
}

function loadStocks() {
    const storedStocks = JSON.parse(localStorage.getItem('stocks')) || [];
    storedStocks.forEach(symbol => {
        const stockInput = document.createElement('div');
        stockInput.classList.add('stock-input');
        stockInput.innerHTML = `
            <input type="text" placeholder="Enter Stock Symbol" class="stock-symbol" value="${symbol}" oninput="saveStocks()">
            <button onclick="removeStock(this)">Remove</button>
        `;
        document.getElementById('stocks-input').appendChild(stockInput);
    });
}

async function getStockData() {
    const stockSymbols = Array.from(document.getElementsByClassName('stock-symbol')).map(input => input.value);
    const stockOutput = document.getElementById('stocks-output');
    stockOutput.innerHTML = 'Fetching stock data...';

    const promises = stockSymbols.map(symbol => fetchStockData(symbol));
    const results = await Promise.all(promises);

    stockOutput.dataset.json = JSON.stringify(results, null, 2);
    stockOutput.dataset.formatted = await Promise.all(results.map(async result => await formatStockData(result)));
    stockOutput.innerHTML = stockOutput.dataset.formatted.join('<br>');
}

async function fetchStockData(symbol) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${alphaVantageApiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
        return { symbol, error: 'Data not available' };
    }

    const dates = Object.keys(timeSeries).slice(0, 30).reverse();
    const values = dates.map(date => parseFloat(timeSeries[date]['4. close']));
    const latestData = values[values.length - 1];
    const oneMonthAgoData = values[0];

    const currentPrice = latestData;
    const previousClose = oneMonthAgoData;
    const dollarChange = (currentPrice - previousClose).toFixed(2);
    const percentChange = ((dollarChange / previousClose) * 100).toFixed(2);

    const chartUrl = await generateChartUrl(values, latestData, oneMonthAgoData);

    return {
        symbol,
        currentPrice,
        previousClose,
        dollarChange,
        percentChange,
        chartUrl
    };
}

async function generateChartUrl(values, latestData, oneMonthAgoData) {
    const canvas = document.createElement('canvas');
    canvas.width = 320; // Example width
    canvas.height = 160; // Example height
    const ctx = canvas.getContext('2d');

    const isPositive = latestData >= oneMonthAgoData;
    const color = isPositive ? '#00FF00' : '#FF0000';

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((value, index) => {
        const x = (index / (values.length - 1)) * canvas.width;
        const y = canvas.height - (value / Math.max(...values)) * canvas.height;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    return new Promise(resolve => {
        canvas.toDataURL('image/bmp', (dataUrl) => {
            resolve(dataUrl);
        });
    });
}

async function formatStockData(data) {
    if (data.error) {
        return `<div>${data.symbol}: ${data.error}</div>`;
    }

    return `
        <div>
            <strong>${data.symbol}</strong><br>
            Current Price: $${data.currentPrice}<br>
            Previous Close: $${data.previousClose}<br>
            $ Change: $${data.dollarChange}<br>
            % Change: ${data.percentChange}%<br>
            <img src="${data.chartUrl}" alt="Stock Chart for ${data.symbol}">
        </div>
    `;
}

function toggleStockView() {
    const stockOutput = document.getElementById('stocks-output');
    if (stockOutput.innerHTML.trim() === stockOutput.dataset.formatted.trim()) {
        stockOutput.textContent = stockOutput.dataset.json;
    } else {
        stockOutput.innerHTML = stockOutput.dataset.formatted;
    }
}
