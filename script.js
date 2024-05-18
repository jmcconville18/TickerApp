async function getWeather() {
    const zipCode = document.getElementById('zipCode').value;
    const output = document.getElementById('output');
    const apiKey = 'YOUR_API_KEY';  // Replace with your actual API key
    const url = `https://api.open-meteo.com/v1/forecast?zip=${zipCode}&units=imperial`;

    output.textContent = 'Fetching weather data...';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
            throw new Error('No data returned from the API.');
        }

        output.dataset.json = JSON.stringify(data, null, 2);
        output.dataset.formatted = formatWeatherData(data);
        output.textContent = output.dataset.formatted;
    } catch (error) {
        output.textContent = `Error fetching weather data: ${error.message}`;
        console.error('Fetch error:', error);
    }
}

function formatWeatherData(data) {
    return `
        Location: ${data.city}
        Temperature: ${data.temperature} °F
        Humidity: ${data.humidity} %
        Wind Speed: ${data.wind_speed} mph
        Weather: ${data.weather.description}
    `;
}

function toggleView() {
    const output = document.getElementById('output');
    if (output.textContent === output.dataset.formatted) {
        output.textContent = output.dataset.json;
    } else {
        output.textContent = output.dataset.formatted;
    }
}
