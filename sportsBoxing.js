async function getBoxingScores() {
    const league = {
        name: 'Boxing',
        url: 'https://www.boxingnews24.com/'
    };

    let results = '';
    const simplifiedJsonResults = [];

    const response = await fetch(league.url);
    const data = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');

    const leagueJson = {
        league: league.name,
        apiUrl: league.url,
        games: []
    };

    results += `<h3>${league.name}</h3>`;

    const events = doc.querySelectorAll('.entry-title a');
    if (events.length > 0) {
        const nextEvent = events[0];
        const eventName = nextEvent.textContent.trim();
        const eventDateElem = nextEvent.parentElement.nextElementSibling;
        const eventDate = eventDateElem ? eventDateElem.textContent.trim() : 'Unknown Date';
        const eventTime = luxon.DateTime.fromFormat(eventDate, 'MMMM d, yyyy h:mm A').setZone('America/New_York').toLocaleString(luxon.DateTime.DATETIME_SHORT);

        results += `<p>Next Main Event: ${eventName} on ${eventTime}</p>`;
        leagueJson.games.push({
            event: eventName,
            dateTime: eventTime,
            status: 'upcoming'
        });
    }

    return { formatted: results, json: leagueJson };
}
