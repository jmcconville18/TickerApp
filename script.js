async function getWeather() {
    const zipCode = document.getElementById('zipCode').value;
    const output = document.getElementById('output');
    const apiKey = 'YOUR_API_KEY';  // Replace with your actual API key
    const url = `https://api.open-meteo.com/v1/forecast?zip=${zipCode}&units=imperial`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        output.dataset.json = JSON.stringify(data, null, 2);
        output.dataset.formatted = formatWeatherData(data);
        output.textContent = output.dataset.formatted;
    } catch (error) {
        output.textContent = 'Error fetching weather data';
        console.error(error);
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
