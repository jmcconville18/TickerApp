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
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error(`Error: ${weatherResponse.status} ${weatherResponse.statusText}`);
        }

        const weatherData = await weatherResponse.json();

        if (!weatherData || !weatherData.current_weather) {
            throw new Error('No weather data returned from the API.');
        }

        // Get timezone info
        const timezone = weatherData.timezone;

        output.dataset.json = JSON.stringify(weatherData, null, 2);
        output.dataset.formatted = formatWeatherData(weatherData.current_weather, timezone);
        output.innerHTML = output.dataset.formatted; // Use innerHTML for better formatting
    } catch (error) {
        output.textContent = `Error fetching weather data: ${error.message}`;
        console.error('Fetch error:', error);
    }
}

function formatWeatherData(data, timezone) {
    const DateTime = luxon.DateTime;
    const localTime = DateTime.fromISO(data.time).setZone(timezone).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

    return `
        <div class="weather-attribute"><strong>Temperature:</strong> ${data.temperature} °F</div>
        <div class="weather-attribute"><strong>Wind Speed:</strong> ${data.windspeed} mph</div>
        <div class="weather-attribute"><strong>Wind Direction:</strong> ${data.winddirection}°</div>
        <div class="weather-attribute"><strong>Weather Code:</strong> ${data.weathercode}</div>
        <div class="weather-attribute"><strong>Humidity:</strong> ${data.humidity} %</div>
        <div class="weather-attribute"><strong>Pressure:</strong> ${data.pressure} hPa</div>
        <div class="weather-attribute"><strong>Precipitation:</strong> ${data.precipitation} inches</div>
        <div class="weather-attribute"><strong>Time:</strong> ${localTime}</div>
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
