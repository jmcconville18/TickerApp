const stockUrl = 'https://api.twelvedata.com/time_series';

async function getStockData() {
    const symbol = document.getElementById('symbol').value;
    const output = document.getElementById('output');

    output.textContent = 'Fetching stock data...';

    const stockApiUrl = `${stockUrl}?symbol=${symbol}&interval=1day&apikey=${TWELVE_DATA_API_KEY}`;

    try {
        const stockResponse = await fetch(stockApiUrl);

        if (!stockResponse.ok) {
            throw new Error(`Error: ${stockResponse.status} ${stockResponse.statusText} - URL: ${stockApiUrl}`);
        }

        const stockData = await stockResponse.json();

        if (!stockData || !stockData.values || stockData.values.length === 0) {
            throw new Error('No stock data returned from the API.');
        }

        output.dataset.json = formatJsonStockData(stockData);
        output.dataset.formatted = formatStockData(stockData);
        output.innerHTML = output.dataset.formatted;
    } catch (error) {
        output.textContent = `Error fetching stock data: ${error.message}`;
        console.error('Fetch error:', error);
    }
}

function formatStockData(data) {
    const { symbol, values } = data;
    const latest = values[0];

    return `
        <h2>Stock Data for ${symbol}</h2>
        <div class="stock-attribute"><strong>Date:</strong> ${latest.datetime}</div>
        <div class="stock-attribute"><strong>Open:</strong> ${latest.open} USD</div>
        <div class="stock-attribute"><strong>High:</strong> ${latest.high} USD</div>
        <div class="stock-attribute"><strong>Low:</strong> ${latest.low} USD</div>
        <div class="stock-attribute"><strong>Close:</strong> ${latest.close} USD</div>
        <div class="stock-attribute"><strong>Volume:</strong> ${latest.volume}</div>
    `;
}

function formatJsonStockData(data) {
    const { symbol, values } = data;
    const latest = values[0];

    return JSON.stringify({
        "Symbol": symbol,
        "Date": latest.datetime,
        "Open": `${latest.open} USD`,
        "High": `${latest.high} USD`,
        "Low": `${latest.low} USD`,
        "Close": `${latest.close} USD`,
        "Volume": latest.volume
    }, null, 2);
}
