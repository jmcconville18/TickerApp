async function getMMAScores() {
    const league = {
        name: 'MMA',
        url: 'https://www.sherdog.com/news/news/latest-mma-news'
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

    const events = doc.querySelectorAll('.content-item');
    if (events.length > 0) {
        const nextEvent = events[0];
        const eventName = nextEvent.querySelector('.title').textContent.trim();
        const eventDate = nextEvent.querySelector('.date').textContent.trim();
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
