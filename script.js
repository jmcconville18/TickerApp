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

        const timezoneOffset = weatherData.timezone;
        const timezone = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset / 3600}`;

        output.dataset.json = formatJsonWeatherData(weatherData, timezone);
        output.dataset.formatted = formatWeatherData(weatherData, timezone);
        output.innerHTML = output.dataset.formatted;
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

    const { main, clouds, rain, snow, weather, sys, dt, visibility, wind } = data;

    const rainInches = rain ? (rain['1h'] / 25.4).toFixed(2) : 0;
    const snowInches = snow ? (snow['1h'] / 25.4).toFixed(2) : 0;

    return `
        <h2>Current Weather</h2>
        <div class="weather-attribute"><strong>Temperature:</strong> ${Math.round(main.temp)} °F</div>
        <div class="weather-attribute"><strong>Feels Like:</strong> ${Math.round(main.feels_like)} °F</div>
        <div class="weather-attribute"><strong>Minimum Temperature:</strong> ${Math.round(main.temp_min)} °F</div>
        <div class="weather-attribute"><strong>Maximum Temperature:</strong> ${Math.round(main.temp_max)} °F</div>
        <div class="weather-attribute"><strong>Pressure:</strong> ${main.pressure} hPa</div>
        <div class="weather-attribute"><strong>Humidity:</strong> ${main.humidity} %</div>
        <div class="weather-attribute"><strong>Visibility:</strong> ${(visibility / 1609.34).toFixed(2)} miles</div>
        <div class="weather-attribute"><strong>Wind Speed:</strong> ${wind.speed} mph</div>
        <div class="weather-attribute"><strong>Wind Gust:</strong> ${wind.gust ? wind.gust : 'N/A'} mph</div>
        <div class="weather-attribute"><strong>Wind Direction:</strong> ${wind.deg}°</div>
        <div class="weather-attribute"><strong>Cloudiness:</strong> ${clouds.all} %</div>
        <div class="weather-attribute"><strong>Rain (last hour):</strong> ${rainInches} inches</div>
        <div class="weather-attribute"><strong>Snow (last hour):</strong> ${snowInches} inches</div>
        <div class="weather-attribute"><strong>Weather:</strong> ${weather[0].description}</div>
        <div class="weather-attribute"><strong>Sunrise:</strong> ${formatTime(sys.sunrise)}</div>
        <div class="weather-attribute"><strong>Sunset:</strong> ${formatTime(sys.sunset)}</div>
        <div class="weather-attribute"><strong>Time of Data Calculation:</strong> ${formatTime(dt)}</div>
    `;
}

function formatJsonWeatherData(data, timezone) {
    const DateTime = luxon.DateTime;

    const formatTime = (timestamp) => {
        return DateTime.fromSeconds(timestamp).setZone(timezone).toFormat('ff');
    };

    const { main, clouds, rain, snow, weather, sys, dt, visibility, wind } = data;

    const rainInches = rain ? (rain['1h'] / 25.4).toFixed(2) : 0;
    const snowInches = snow ? (snow['1h'] / 25.4).toFixed(2) : 0;

    return JSON.stringify({
        "Temperature": `${Math.round(main.temp)} °F`,
        "Feels Like": `${Math.round(main.feels_like)} °F`,
        "Minimum Temperature": `${Math.round(main.temp_min)} °F`,
        "Maximum Temperature": `${Math.round(main.temp_max)} °F`,
        "Pressure": `${main.pressure} hPa`,
        "Humidity": `${main.humidity} %`,
        "Visibility": `${(visibility / 1609.34).toFixed(2)} miles`,
        "Wind Speed": `${wind.speed} mph`,
        "Wind Gust": wind.gust ? `${wind.gust} mph` : 'N/A',
        "Wind Direction": `${wind.deg}°`,
        "Cloudiness": `${clouds.all} %`,
        "Rain (last hour)": `${rainInches} inches`,
        "Snow (last hour)": `${snowInches} inches`,
        "Weather": `${weather[0].description}`,
        "Sunrise": formatTime(sys.sunrise),
        "Sunset": formatTime(sys.sunset),
        "Time of Data Calculation": formatTime(dt)
    }, null, 2);
}

function toggleView() {
    const output = document.getElementById('output');
    if (output.innerHTML.trim() === output.dataset.formatted.trim()) {
        output.textContent = output.dataset.json;
    } else {
        output.innerHTML = output.dataset.formatted;
    }
}
