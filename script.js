#final comment
#seriously
#last time again
dskfljs
document.addEventListener('DOMContentLoaded', () => {
  const zipcodeForm = document.getElementById('zipcode-form');
  const zipcodeInput = document.getElementById('zipcode-input');
  const weatherOutput = document.getElementById('weather-output');
  const toggleButton = document.getElementById('toggle-button');
  let formattedView = true;

  // Load persisted data
  const savedZipcode = localStorage.getItem('zipcode');
  const savedWeatherData = localStorage.getItem('weatherData');
  if (savedZipcode && savedWeatherData) {
    zipcodeInput.value = savedZipcode;
    displayWeather(JSON.parse(savedWeatherData));
  }

  zipcodeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const zipcode = zipcodeInput.value.trim();
    if (zipcode) {
      const weatherData = await fetchWeatherData(zipcode);
      if (weatherData) {
        localStorage.setItem('zipcode', zipcode);
        localStorage.setItem('weatherData', JSON.stringify(weatherData));
        displayWeather(weatherData);
      }
    }
  });

  toggleButton.addEventListener('click', () => {
    formattedView = !formattedView;
    weatherOutput.classList.toggle('json-view', !formattedView);
    weatherOutput.classList.toggle('formatted-view', formattedView);
  });

  async function fetchWeatherData(zipcode) {
    const geocodeApiUrl = `https://api.zippopotam.us/us/${zipcode}`;
    const geocodeResponse = await fetch(geocodeApiUrl);
    if (!geocodeResponse.ok) {
      alert('Failed to fetch location coordinates');
      return null;
    }

    const geocodeData = await geocodeResponse.json();
    const { latitude, longitude, 'place name': city, state } = geocodeData.places[0];
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,weathercode,wind_speed_10m,humidity_2m,cloudcover,surface_pressure&daily=sunrise,sunset,uv_index_max&timezone=auto`;
    const weatherResponse = await fetch(weatherApiUrl);
    if (!weatherResponse.ok) {
      alert('Failed to fetch weather data');
      return null;
    }

    const weatherData = await weatherResponse.json();
    weatherData.city = city;
    weatherData.state = state;
    return weatherData;
  }

  function displayWeather(data) {
    if (formattedView) {
      const temperature = (data.hourly.temperature_2m[0] * 9/5 + 32).toFixed(1); // Convert to Fahrenheit
      const precipitation = (data.hourly.precipitation[0] * 0.0393701).toFixed(2); // Convert to inches
      const weatherCode = data.hourly.weathercode[0];
      const windSpeed = (data.hourly.wind_speed_10m[0] * 2.23694).toFixed(1); // Convert to mph
      const humidity = data.hourly.humidity_2m[0];
      const cloudCover = data.hourly.cloudcover[0];
      const pressure = (data.hourly.surface_pressure[0] * 0.0295301).toFixed(2); // Convert to inHg
      const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', hour12: true });
      const sunset = new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', hour12: true });
      const uvIndex = data.daily.uv_index_max[0];
	  #heres a comment

      weatherOutput.innerHTML = `
        <p><strong>City:</strong> ${data.city}, ${data.state}</p>
        <p><strong>Temperature:</strong> ${temperature}°F</p>
        <p><strong>Precipitation:</strong> ${precipitation} in</p>
        <p><strong>Weather Code:</strong> ${weatherCode}</p>
        <p><strong>Wind Speed:</strong> ${windSpeed} mph</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Cloud Cover:</strong> ${cloudCover}%</p>
        <p><strong>Pressure:</strong> ${pressure} inHg</p> 
        <p><strong>Sunrise:</strong> ${sunrise}</p>
        <p><strong>Sunset:</strong> ${sunset}</p>
        <p><strong>UV Index:</strong> ${uvIndex}</p>
      `;
    } else {
      weatherOutput.textContent = JSON.stringify(data, null, 2);
    }
  }
});
