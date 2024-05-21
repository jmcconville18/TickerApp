const stockUrl = 'https://api.twelvedata.com/time_series';
const DEFAULT_SYMBOLS = 'AAPL,MSFT,NVDA,CRM';

function getStoredSymbols() {
    return localStorage.getItem('stockSymbols') || DEFAULT_SYMBOLS;
}

function storeSymbols(symbols) {
    localStorage.setItem('stockSymbols', symbols);
}

async function getStockData() {
    const symbolInput = document.getElementById('symbol');
    const output = document.getElementById('stocks-output');
    const symbols = symbolInput.value.split(',').map(s => s.trim()).filter(s => s);

    if (symbols.length === 0) {
        output.textContent = 'Please enter at least one stock symbol.';
        return;
    }

    storeSymbols(symbols.join(','));
    symbolInput.value = symbols.join(',');

    output.textContent = 'Fetching stock data...';

    try {
        const stockDataPromises = symbols.map(symbol => fetchStockData(symbol));
        const stockDataArray = await Promise.all(stockDataPromises);

        const formattedData = stockDataArray.map(data => formatStockData(data)).join('<br><br>');
        const jsonData = stockDataArray.map(data => formatJsonStockData(data)).join(',\n');

        output.dataset.json = `[${jsonData}]`;
        output.dataset.formatted = formattedData;
        output.innerHTML = formattedData;
    } catch (error) {
        output.textContent = `Error fetching stock data: ${error.message}`;
        console.error('Fetch error:', error);
    }
}

async function fetchStockData(symbol) {
    const stockApiUrl = `${stockUrl}?symbol=${symbol}&interval=1day&apikey=${TWELVE_DATA_API_KEY}`;

    const stockResponse = await fetch(stockApiUrl);

    if (!stockResponse.ok) {
        throw new Error(`Error: ${stockResponse.status} ${stockResponse.statusText} - URL: ${stockApiUrl}`);
    }

    const stockData = await stockResponse.json();

    if (!stockData || !stockData.values || stockData.values.length === 0) {
        throw new Error('No stock data returned from the API.');
    }

    stockData.symbol = symbol;  // Include symbol in the data object

    return stockData;
}

function calculateMovingAverage(values, days) {
    const relevantValues = values.slice(0, days);
    const sum = relevantValues.reduce((total, value) => total + parseFloat(value.close), 0);
    return sum / relevantValues.length;
}

function formatStockData(data) {
    const { symbol, values } = data;
    const latest = values[0];
    const previous = values[1];

    const close = parseFloat(latest.close);
    const prevClose = parseFloat(previous.close);
    const change = close - prevClose;
    const percentChange = (change / prevClose) * 100;

    const weekMA = calculateMovingAverage(values, 7);
    const weekChange = close - weekMA;
    const weekPercentChange = (weekChange / weekMA) * 100;

    const monthMA = calculateMovingAverage(values, 30);
    const monthChange = close - monthMA;
    const monthPercentChange = (monthChange / monthMA) * 100;

    return `
        <h2>Stock Data for ${symbol}</h2>
        <div class="stock-attribute"><strong>Date:</strong> ${latest.datetime}</div>
        <div class="stock-attribute"><strong>Open:</strong> ${parseFloat(latest.open).toFixed(2)}</div>
        <div class="stock-attribute"><strong>High:</strong> ${parseFloat(latest.high).toFixed(2)}</div>
        <div class="stock-attribute"><strong>Low:</strong> ${parseFloat(latest.low).toFixed(2)}</div>
        <div class="stock-attribute"><strong>Close:</strong> ${close.toFixed(2)}</div>
        <div class="stock-attribute"><strong>Volume:</strong> ${latest.volume}</div>
        <div class="stock-attribute"><strong>Change:</strong> ${change.toFixed(2)}</div>
        <div class="stock-attribute"><strong>Percent Change:</strong> ${percentChange.toFixed(2)}%</div>
        <div class="stock-attribute"><strong>7-Day Moving Average:</strong> ${weekMA.toFixed(2)}</div>
        <div class="stock-attribute"><strong>Change from 7-Day MA:</strong> ${weekChange.toFixed(2)}</div>
        <div class="stock-attribute"><strong>Percent Change from 7-Day MA:</strong> ${weekPercentChange.toFixed(2)}%</div>
        <div class="stock-attribute"><strong>30-Day Moving Average:</strong> ${monthMA.toFixed(2)}</div>
        <div class="stock-attribute"><strong>Change from 30-Day MA:</strong> ${monthChange.toFixed(2)}</div>
        <div class="stock-attribute"><strong>Percent Change from 30-Day MA:</strong> ${monthPercentChange.toFixed(2)}%</div>
    `;
}

function formatJsonStockData(data) {
    const { symbol, values } = data;
    const latest = values[0];
    const previous = values[1];

    const close = parseFloat(latest.close);
    const prevClose = parseFloat(previous.close);
    const change = close - prevClose;
    const percentChange = (change / prevClose) * 100;

    const weekMA = calculateMovingAverage(values, 7);
    const weekChange = close - weekMA;
    const weekPercentChange = (weekChange / weekMA) * 100;

    const monthMA = calculateMovingAverage(values, 30);
    const monthChange = close - monthMA;
    const monthPercentChange = (monthChange / monthMA) * 100;

    return JSON.stringify({
        "Symbol": symbol,
        "Date": latest.datetime,
        "Open": parseFloat(latest.open).toFixed(2),
        "High": parseFloat(latest.high).toFixed(2),
        "Low": parseFloat(latest.low).toFixed(2),
        "Close": close.toFixed(2),
        "Volume": latest.volume,
        "Change": change.toFixed(2),
        "Percent Change": `${percentChange.toFixed(2)}%`,
        "7-Day Moving Average": weekMA.toFixed(2),
        "Change from 7-Day MA": weekChange.toFixed(2),
        "Percent Change from 7-Day MA": `${weekPercentChange.toFixed(2)}%`,
        "30-Day Moving Average": monthMA.toFixed(2),
        "Change from 30-Day MA": monthChange.toFixed(2),
        "Percent Change from 30-Day MA": `${monthPercentChange.toFixed(2)}%`,
        "API Call": `${stockUrl}?symbol=${symbol}&interval=1day&apikey=${TWELVE_DATA_API_KEY}`
    }, null, 2);
}

document.addEventListener('DOMContentLoaded', () => {
    const symbolInput = document.getElementById('symbol');
    symbolInput.value = getStoredSymbols();
});
