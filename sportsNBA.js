async function getNBAScores() {
    const league = {
        name: 'NBA',
        teams: document.getElementById('nbaTeams').value.split(',').map(team => team.trim().toUpperCase()),
        url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
    };

    let results = '';
    const simplifiedJsonResults = [];

    const response = await fetch(league.url);
    const data = await response.json();
    const games = data.events;

    const leagueJson = {
        league: league.name,
        apiUrl: league.url,
        games: []
    };

    results += `<h3>${league.name}</h3>`;

    const now = luxon.DateTime.local().setZone('America/New_York');
    const today = now.toISODate();
    const yesterday = now.minus({ days: 1 }).toISODate();

    games.forEach(game => {
        const gameDate = convertToEST(game.date).toISODate();
        const gameTime = convertToEST(game.date).toLocaleString(luxon.DateTime.DATETIME_SHORT);

        if (gameDate === today) {
            const homeTeam = game.competitions[0].competitors[0].team.abbreviation;
            const awayTeam = game.competitions[0].competitors[1].team.abbreviation;
            const status = game.status.type.name;

            if (status === 'STATUS_IN_PROGRESS') {
                const homeScore = game.competitions[0].competitors[0].score;
                const awayScore = game.competitions[0].competitors[1].score;
                const period = game.status.period;
                const clock = game.status.displayClock;
                results += `<p>${homeTeam} vs ${awayTeam}: ${homeScore} - ${awayScore} (Period: ${period}, Time: ${clock})</p>`;
                leagueJson.games.push({
                    homeTeam,
                    awayTeam,
                    homeScore,
                    awayScore,
                    period,
                    clock,
                    status: 'in progress'
                });
            } else {
                results += `<p>${homeTeam} vs ${awayTeam} at ${gameTime}</p>`;
                leagueJson.games.push({
                    homeTeam,
                    awayTeam,
                    gameTime,
                    status: 'scheduled'
                });
            }
        } else if (gameDate === yesterday) {
            const homeTeam = game.competitions[0].competitors[0].team.abbreviation;
            const awayTeam = game.competitions[0].competitors[1].team.abbreviation;
            const homeScore = game.competitions[0].competitors[0].score;
            const awayScore = game.competitions[0].competitors[1].score;
            results += `<p>${homeTeam} ${homeScore} - ${awayTeam} ${awayScore} (Yesterday)</p>`;
            leagueJson.games.push({
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                status: 'completed'
            });
        }
    });

    league.teams.forEach(team => {
        const game = games.find(game => game.competitions[0].competitors.some(competitor => competitor.team.abbreviation.toUpperCase() === team));
        if (game) {
            const homeTeam = game.competitions[0].competitors[0].team.abbreviation;
            const awayTeam = game.competitions[0].competitors[1].team.abbreviation;
            const gameTime = convertToEST(game.date).toLocaleString(luxon.DateTime.DATETIME_SHORT);
            results += `<p>Next game for ${team}: ${homeTeam} vs ${awayTeam} at ${gameTime}</p>`;
            leagueJson.games.push({
                team,
                homeTeam,
                awayTeam,
                gameTime,
                status: 'next'
            });
        }
    });

    return { formatted: results, json: leagueJson };
}
