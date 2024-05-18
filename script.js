const apiKey = '688e77c8723821db62ddccb30bfb7630';
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

async function getWeather() {
    const zipCode = document.getElementById('zipCode').value;
    const output = document.getElementById('output');
    const geoUrl = `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=US&format=json`;

    output.textContent = 'Fetching weather data...';

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
        const weatherUrl = `${baseUrl}?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error(`Error: ${weatherResponse.status} ${weatherResponse.statusText} - URL: ${weatherUrl}`);
        }

        const weatherData = await weatherResponse.json();

        if (!weatherData || !weatherData.main) {
            throw new Error('No weather data returned from the API.');
        }

        const timezone = weatherData.timezone;

        output.dataset.json = JSON.stringify(weatherData, null, 2);
        output.dataset.formatted = formatWeatherData(weatherData, timezone);
        output.innerHTML = output.dataset.formatted; // Use innerHTML for better formatting
    } catch (error) {
        output.textContent = `Error fetching weather data: ${error.message}`;
        console.error('Fetch error:', error);
    }
}

function formatWeatherData(data, timezone) {
    const DateTime = luxon.DateTime;

    const formatTime = (timestamp) => {
        return DateTime.fromSeconds(timestamp).setZone(timezone).toFormat('ff');
    };

    const { main, clouds, rain, snow, weather, sys, dt } = data;

    return `
        <h2>Current Weather</h2>
        <div class="weather-attribute"><strong>Temperature:</strong> ${main.temp} °F</div>
        <div class="weather-attribute"><strong>Humidity:</strong> ${main.humidity} %</div>
        <div class="weather-attribute"><strong>Cloudiness:</strong> ${clouds.all} %</div>
        <div class="weather-attribute"><strong>Rain (last hour):</strong> ${rain ? rain['1h'] : 0} mm</div>
        <div class="weather-attribute"><strong>Snow (last hour):</strong> ${snow ? snow['1h'] : 0} mm</div>
        <div class="weather-attribute"><strong>Weather:</strong> ${weather[0].description}</div>
        <div class="weather-attribute"><strong>Sunrise:</strong> ${formatTime(sys.sunrise)}</div>
        <div class="weather-attribute"><strong>Sunset:</strong> ${formatTime(sys.sunset)}</div>
        <div class="weather-attribute"><strong>Time:</strong> ${formatTime(dt)}</div>
    `;
}

function toggleView() {
    const output = document.getElementById('output');
    if (output.innerHTML === output.dataset.json) {
        output.innerHTML = output.dataset.formatted;
    } else {
        output.textContent = output.dataset.json;
    }
}
