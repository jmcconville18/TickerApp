document.addEventListener('DOMContentLoaded', loadStocks);

function saveStocks() {
    const stockSymbols = document.getElementById('stockSymbols').value;
    localStorage.setItem('stocks', stockSymbols);
}

function loadStocks() {
    let storedStocks = localStorage.getItem('stocks');
    if (!storedStocks) {
        storedStocks = 'AAPL,MSFT,NVDA,CRM';
        localStorage.setItem('stocks', storedStocks);
    }
    document.getElementById('stockSymbols').value = storedStocks;
}

async function getStockData() {
    saveStocks(); // Ensure the latest symbols are saved before fetching data
    const stockSymbols = document.getElementById('stockSymbols').value.split(',').map(symbol => symbol.trim().toUpperCase());
    const stockOutput = document.getElementById('stocks-output');

    console.log('Fetching stock data for symbols:', stockSymbols);
    stockOutput.textContent = 'Fetching stock data...';

    try {
        const promises = stockSymbols.map(symbol => fetchStockData(symbol));
        const results = await Promise.all(promises);

        console.log('Fetched stock data results:', results);
        stockOutput.dataset.json = JSON.stringify(results, null, 2);
        stockOutput.dataset.formatted = formatStockData(results);
        console.log('Formatted data:', stockOutput.dataset.formatted);
        console.log('JSON data:', stockOutput.dataset.json);
        stockOutput.innerHTML = stockOutput.dataset.formatted;
    } catch (error) {
        stockOutput.textContent = `Error fetching stock data: ${error.message}`;
        console.error('Fetch error:', error);
    }
}

async function fetchStockData(symbol) {
    const twelveDataApiKey = TWELVE_DATA_API_KEY; // Pulling from config file
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=${twelveDataApiKey}`;

    console.log('Fetching data for URL:', url);
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
    console.log('Formatting stock data:', data);
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
    console.log('Toggling view. Current innerHTML:', stockOutput.innerHTML.trim());
    console.log('Formatted data:', stockOutput.dataset.formatted);
    console.log('JSON data:', stockOutput.dataset.json);

    if (stockOutput.innerHTML.trim() === stockOutput.dataset.formatted.trim()) {
        stockOutput.innerHTML = `<pre>${stockOutput.dataset.json}</pre>`;
    } else {
        stockOutput.innerHTML = stockOutput.dataset.formatted;
    }
}
