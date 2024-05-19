const alphaVantageApiKey = 'your_alpha_vantage_api_key';

document.addEventListener('DOMContentLoaded', loadStocks);

function saveStocks() {
    const stockSymbols = document.getElementById('stockSymbols').value;
    localStorage.setItem('stocks', stockSymbols);
}

function loadStocks() {
    const storedStocks = localStorage.getItem('stocks') || 'MSFT,AAPL,NVDA,CRM';
    document.getElementById('stockSymbols').value = storedStocks;
}

async function getStockData() {
    const stockSymbols = document.getElementById('stockSymbols').value.split(',').map(symbol => symbol.trim());
    const stockOutput = document.getElementById('stocks-output');
    stockOutput.innerHTML = 'Fetching stock data...';

    const promises = stockSymbols.map(symbol => fetchStockData(symbol));
    const results = await Promise.all(promises);

    stockOutput.dataset.json = JSON.stringify(results, null, 2);
    stockOutput.dataset.formatted = results.map(result => formatStockData(result)).join('<br>');
    stockOutput.innerHTML = stockOutput.dataset.formatted;
}

async function fetchStockData(symbol) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${alphaVantageApiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
        return { symbol, error: 'Data not available' };
    }

    const dates = Object.keys(timeSeries);
    const latestDate = dates[0];
    const previousDate = dates.find(date => {
        const diff = new Date(latestDate).getTime() - new Date(date).getTime();
        return diff >= 30 * 24 * 60 * 60 * 1000;
    });

    const latestData = timeSeries[latestDate];
    const previousData = timeSeries[previousDate];

    const currentPrice = parseFloat(latestData['4. close']);
    const previousClose = parseFloat(previousData['4. close']);
    const dollarChange = (currentPrice - previousClose).toFixed(2);
    const percentChange = ((dollarChange / previousClose) * 100).toFixed(2);

    return {
        symbol,
        currentPrice,
        previousClose,
        dollarChange,
        percentChange
    };
}

function formatStockData(data) {
    if (data.error) {
        return `<div>${data.symbol}: ${data.error}</div>`;
    }

    return `
        <div>
            <strong>${data.symbol}</strong><br>
            Current Price: $${data.currentPrice}<br>
            Previous Close: $${data.previousClose}<br>
            $ Change: $${data.dollarChange}<br>
            % Change: ${data.percentChange}%
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
