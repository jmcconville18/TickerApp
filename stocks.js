const twelveDataApiUrl = 'https://api.twelvedata.com/time_series';

async function getStockData() {
    const stockSymbols = document.getElementById('stockSymbols').value.split(',').map(symbol => symbol.trim().toUpperCase());
    const stockOutput = document.getElementById('stocks-output');

    stockOutput.textContent = 'Fetching stock data...';

    try {
        const promises = stockSymbols.map(symbol => fetchStockData(symbol));
        const results = await Promise.all(promises);

        stockOutput.dataset.json = formatJsonStockData(results);
        stockOutput.dataset.formatted = formatStockData(results);
        stockOutput.innerHTML = stockOutput.dataset.formatted;
    } catch (error) {
        stockOutput.textContent = `Error fetching stock data: ${error.message}`;
        console.error('Fetch error:', error);
    }
}

async function fetchStockData(symbol) {
    const twelveDataApiKey = TWELVE_DATA_API_KEY; // Pulling from config file
    const url = `${twelveDataApiUrl}?symbol=${symbol}&interval=1min&apikey=${twelveDataApiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const timeSeries = data['values'];

    if (!timeSeries) {
        return { symbol, error: 'Data not available', apiCall: url };
    }

    const latestData = timeSeries[0];
    const previousData = timeSeries[1];

    const currentPrice = parseFloat(latestData['close']);
    const previousClose = parseFloat(previousData['close']);
    const dollarChange = (currentPrice - previousClose).toFixed(2);
    const percentChange = ((dollarChange / previousClose) * 100).toFixed(2);

    return {
        symbol,
        currentPrice,
        previousClose,
        dollarChange,
        percentChange,
        apiCall: url
    };
}

function formatStockData(data) {
    return data.map(stock => {
        if (stock.error) {
            return `<div>${stock.symbol}: ${stock.error}<br>API Call: ${stock.apiCall}</div>`;
        }

        return `
            <div>
                <strong>${stock.symbol}</strong><br>
                Current Price: $${stock.currentPrice}<br>
                Previous Close: $${stock.previousClose}<br>
                $ Change: $${stock.dollarChange}<br>
                % Change: ${stock.percentChange}%<br>
                API Call: ${stock.apiCall}
            </div>
        `;
    }).join('<br>');
}

function formatJsonStockData(data) {
    return JSON.stringify(data, null, 2);
}

function toggleStockView() {
    const stockOutput = document.getElementById('stocks-output');
    if (stockOutput.innerHTML.trim() === stockOutput.dataset.formatted.trim()) {
        stockOutput.textContent = stockOutput.dataset.json;
    } else {
        stockOutput.innerHTML = stockOutput.dataset.formatted;
    }
}
