const apiKey = '688e77c8723821db62ddccb30bfb7630';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

async function getForecast() {
    const zipCode = document.getElementById('zipCode').value;
    const output = document.getElementById('output');
    const geoUrl = `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=US&format=json`;

    output.textContent = 'Fetching forecast data...';

    try {
        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error(`Error: ${geoResponse.status} ${geoResponse.statusText}`);
        }

        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            throw new Error('Invalid ZIP code or location not found.');
        }

        const { lat, lon } = geoData[0];
        const forecastApiUrl = `${forecastUrl}?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

        const forecastResponse = await fetch(forecastApiUrl);

        if (!forecastResponse.ok) {
            throw new Error(`Error: ${forecastResponse.status} ${forecastResponse.statusText} - URL: ${forecastApiUrl}`);
        }

        const forecastData = await forecastResponse.json();

        if (!forecastData || !forecastData.list) {
            throw new Error('No forecast data returned from the API.');
        }

        output.dataset.json = formatJsonForecastData(forecastData);
        output.dataset.formatted = formatForecastData(forecastData);
        output.innerHTML = output.dataset.formatted;
    } catch (error) {
        output.textContent = `Error fetching forecast data: ${error.message}`;
        console.error('Fetch error:', error);
    }
}

function formatForecastData(data) {
    const DateTime = luxon.DateTime;
    const days = {};

    data.list.forEach(item => {
        const date = DateTime.fromSeconds(item.dt).toFormat('yyyy-MM-dd');
        if (!days[date]) {
            days[date] = {
                high: item.main.temp_max,
                low: item.main.temp_min,
                descriptions: []
            };
        } else {
            days[date].high = Math.max(days[date].high, item.main.temp_max);
            days[date].low = Math.min(days[date].low, item.main.temp_min);
        }
        days[date].descriptions.push(item.weather[0].description);
    });

    let formattedData = '<h2>5-Day Forecast</h2>';
    for (const date in days) {
        formattedData += `
            <div class="forecast-day">
                <strong>${date}</strong><br>
                High: ${Math.round(days[date].high)} °F, Low: ${Math.round(days[date].low)} °F<br>
                ${days[date].descriptions.join(', ')}
            </div>`;
    }

    return formattedData;
}

function formatJsonForecastData(data) {
    const DateTime = luxon.DateTime;
    const days = {};

    data.list.forEach(item => {
        const date = DateTime.fromSeconds(item.dt).toFormat('yyyy-MM-dd');
        if (!days[date]) {
            days[date] = {
                high: item.main.temp_max,
                low: item.main.temp_min,
                descriptions: []
            };
        } else {
            days[date].high = Math.max(days[date].high, item.main.temp_max);
            days[date].low = Math.min(days[date].low, item.main.temp_min);
        }
        days[date].descriptions.push(item.weather[0].description);
    });

    return JSON.stringify(days, null, 2);
}
