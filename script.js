const apiKey = '688e77c8723821db62ddccb30bfb7630';
const baseUrl = 'https://api.openweathermap.org/data/2.5/onecall';

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

        if (!weatherData || !weatherData.current) {
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

    const current = data.current;
    const daily = data.daily[0];

    return `
        <h2>Current Weather</h2>
        <div class="weather-attribute"><strong>Temperature:</strong> ${current.temp} °F</div>
        <div class="weather-attribute"><strong>Humidity:</strong> ${current.humidity} %</div>
        <div class="weather-attribute"><strong>Cloudiness:</strong> ${current.clouds} %</div>
        <div class="weather-attribute"><strong>UV Index:</strong> ${current.uvi}</div>
        <div class="weather-attribute"><strong>Rain (last hour):</strong> ${current.rain ? current.rain['1h'] : 0} mm</div>
        <div class="weather-attribute"><strong>Snow (last hour):</strong> ${current.snow ? current.snow['1h'] : 0} mm</div>
        <div class="weather-attribute"><strong>Weather:</strong> ${current.weather[0].description}</div>
        <div class="weather-attribute"><strong>Sunrise:</strong> ${formatTime(current.sunrise)}</div>
        <div class="weather-attribute"><strong>Sunset:</strong> ${formatTime(current.sunset)}</div>
        <div class="weather-attribute"><strong>Time:</strong> ${formatTime(current.dt)}</div>

        <h2>Daily Weather Forecast</h2>
        <div class="weather-attribute"><strong>Date:</strong> ${formatTime(daily.dt)}</div>
        <div class="weather-attribute"><strong>Min Temperature:</strong> ${daily.temp.min} °F</div>
        <div class="weather-attribute"><strong>Max Temperature:</strong> ${daily.temp.max} °F</div>
        <div class="weather-attribute"><strong>Humidity:</strong> ${daily.humidity} %</div>
        <div class="weather-attribute"><strong>Cloudiness:</strong> ${daily.clouds} %</div>
        <div class="weather-attribute"><strong>Rain:</strong> ${daily.rain ? daily.rain : 0} mm</div>
        <div class="weather-attribute"><strong>Snow:</strong> ${daily.snow ? daily.snow : 0} mm</div>
        <div class="weather-attribute"><strong>Weather:</strong> ${daily.weather[0].description}</div>
        <div class="weather-attribute"><strong>UV Index:</strong> ${daily.uvi}</div>
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
