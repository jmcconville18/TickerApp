const marineUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
const supportedProducts = ['water_temperature', 'wind', 'water_level'];
const tideProduct = 'predictions'; // Change this to 'predictions' for tide data
const stationId = '8467150'; // Station ID for Bridgeport, CT

async function getMarineData() {
    const output = document.getElementById('marine-output');
    output.textContent = 'Fetching marine data...';

    const currentDate = new Date();
    const beginDate = formatDate(currentDate);
    const endDate = formatDate(new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000)); // 3 days into the future

    try {
        const marineData = {};

        // Fetch marine conditions
        for (const product of supportedProducts) {
            try {
                const productData = await fetchMarineData(product, stationId, beginDate, endDate);
                marineData[product] = {
                    data: productData.data[0],
                    apiUrl: productData.apiUrl
                };
            } catch (error) {
                console.error(`Error fetching ${product} data: ${error.message}`);
                marineData[product] = {
                    data: { v: 'N/A', s: 'N/A', d: 'N/A' },
                    apiUrl: error.apiUrl
                };
            }
        }

        // Fetch tide predictions
        try {
            const tideData = await fetchTideData(stationId, beginDate, endDate);
            marineData['tides'] = {
                data: processTideData(tideData.predictions),
                apiUrl: tideData.apiUrl
            };
        } catch (error) {
            console.error(`Error fetching tide data: ${error.message}`);
            marineData['tides'] = {
                data: [],
                apiUrl: error.apiUrl
            };
        }

        output.dataset.json = formatJsonMarineData(marineData);
        output.dataset.formatted = formatMarineData(marineData);
        output.innerHTML = output.dataset.formatted;
        document.getElementById('toggle-button').style.display = 'inline-block'; // Show the toggle button
    } catch (error) {
        output.textContent = `Error fetching marine data: ${error.message}`;
        console.error('Fetch error:', error);
    }
}

async function fetchMarineData(product, stationId, beginDate, endDate) {
    const apiUrl = `${marineUrl}?product=${product}&application=web_services&begin_date=${beginDate}&end_date=${endDate}&datum=MLLW&station=${stationId}&time_zone=gmt&units=english&format=json`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
        const error = new Error(`Error fetching ${product} data: ${response.status} ${response.statusText}`);
        error.apiUrl = apiUrl;
        throw error;
    }

    const data = await response.json();
    data.apiUrl = apiUrl; // Include the API URL used
    return data;
}

async function fetchTideData(stationId, beginDate, endDate) {
    const apiUrl = `${marineUrl}?product=${tideProduct}&application=web_services&begin_date=${beginDate}&end_date=${endDate}&datum=MLLW&station=${stationId}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
        const error = new Error(`Error fetching tide data: ${response.status} ${response.statusText}`);
        error.apiUrl = apiUrl;
        throw error;
    }

    const data = await response.json();
    data.apiUrl = apiUrl; // Include the API URL used
    return data;
}

function processTideData(data) {
    const tidesByDay = {};

    data.forEach(tide => {
        const date = new Date(tide.t);
        const day = date.toLocaleDateString('en-US');
        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const roundedValue = Math.round(tide.v * 10) / 10;
        const label = tide.type.includes('H') ? 'H - ' : 'L - ';
        const tideString = `${label}${time}; ${roundedValue} feet`;

        if (!tidesByDay[day]) {
            tidesByDay[day] = [];
        }
        tidesByDay[day].push(tideString);
    });

    return tidesByDay;
}

function formatMarineData(data) {
    const windSpeedMph = data.wind?.data.s ? (data.wind.data.s * 1.15078).toFixed(2) : 'N/A';
    const tideSections = Object.keys(data.tides.data).map(day => {
        const tides = data.tides.data[day].join('<br>');
        return `<strong>${day}</strong><br>${tides}`;
    }).join('<br><br>');

    return `
        <h2>Current Marine Data for Station 8467150 (Bridgeport, CT)</h2>
        <div class="marine-attribute"><strong>Water Temperature:</strong> ${data.water_temperature?.data.v || 'N/A'} °F</div>
        <div class="marine-attribute"><strong>Wind Speed:</strong> ${windSpeedMph} MPH</div>
        <div class="marine-attribute"><strong>Wind Direction:</strong> ${data.wind?.data.d || 'N/A'}°</div>
        <div class="marine-attribute"><strong>Water Level:</strong> ${data.water_level?.data.v || 'N/A'} feet</div>
        <div class="marine-attribute"><strong>Next Tides:</strong><br>${tideSections}</div>
    `;
}

function formatJsonMarineData(data) {
    const windSpeedMph = data.wind?.data.s ? (data.wind.data.s * 1.15078).toFixed(2) : 'N/A';
    const tideSections = Object.keys(data.tides.data).reduce((acc, day) => {
        acc[day] = data.tides.data[day];
        return acc;
    }, {});

    return JSON.stringify({
        "Water Temperature": {
            "value": `${data.water_temperature?.data.v || 'N/A'} °F`,
            "apiUrl": data.water_temperature?.apiUrl || 'N/A'
        },
        "Wind Speed": {
            "value": `${windSpeedMph} MPH`,
            "apiUrl": data.wind?.apiUrl || 'N/A'
        },
        "Wind Direction": {
            "value": `${data.wind?.data.d || 'N/A'}°`,
            "apiUrl": data.wind?.apiUrl || 'N/A'
        },
        "Water Level": {
            "value": `${data.water_level?.data.v || 'N/A'} feet`,
            "apiUrl": data.water_level?.apiUrl || 'N/A'
        },
        "Next Tides": tideSections
    }, null, 2);
}

function formatDate(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
}

function toggleMarineView() {
    const output = document.getElementById('marine-output');
    if (output.innerHTML.trim() === output.dataset.formatted.trim()) {
        output.textContent = output.dataset.json;
    } else {
        output.innerHTML = output.dataset.formatted;
    }
}
