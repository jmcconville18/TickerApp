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

        const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home').team.abbreviation;
        const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away').team.abbreviation;
        const status = game.status.type.name;
        const seriesTitle = game.competitions[0].series ? game.competitions[0].series.title : '';
        const seriesSummary = game.competitions[0].series ? game.competitions[0].series.summary : '';

        let playoffDetails = '';
        if (seriesTitle) {
            playoffDetails = `${seriesTitle}${seriesSummary ? `, ${seriesSummary}` : ''}`;
        }

        if (gameDate === today) {
            if (status === 'STATUS_IN_PROGRESS' || status === 'STATUS_HALFTIME' || status === 'STATUS_FINAL') {
                const homeScore = game.competitions[0].competitors.find(c => c.homeAway === 'home').score;
                const awayScore = game.competitions[0].competitors.find(c => c.homeAway === 'away').score;
                const period = game.status.period;
                const clock = game.status.displayClock;
                const gameStatus = status === 'STATUS_FINAL' ? 'Final' : `Q${period} - ${clock}`;
                results += `<p>${awayTeam} vs ${homeTeam}: ${awayScore} - ${homeScore} (${gameStatus}${playoffDetails ? ', ' + playoffDetails : ''})</p>`;
                leagueJson.games.push({
                    homeTeam,
                    awayTeam,
                    homeScore,
                    awayScore,
                    period,
                    clock,
                    status: status === 'STATUS_FINAL' ? 'completed' : 'in progress',
                    playoffDetails: playoffDetails || undefined
                });
            } else {
                results += `<p>${awayTeam} vs ${homeTeam} at ${gameTime}${playoffDetails ? ', ' + playoffDetails : ''}</p>`;
                leagueJson.games.push({
                    homeTeam,
                    awayTeam,
                    gameTime,
                    status: 'scheduled',
                    playoffDetails: playoffDetails || undefined
                });
            }
        } else if (gameDate === yesterday) {
            const homeScore = game.competitions[0].competitors.find(c => c.homeAway === 'home').score;
            const awayScore = game.competitions[0].competitors.find(c => c.homeAway === 'away').score;
            results += `<p>${awayTeam} ${awayScore} - ${homeTeam} ${homeScore} (Yesterday${playoffDetails ? ', ' + playoffDetails : ''})</p>`;
            leagueJson.games.push({
                homeTeam,
                awayTeam,
                homeScore,
                awayScore,
                status: 'completed',
                playoffDetails: playoffDetails || undefined
            });
        }
    });

    league.teams.forEach(team => {
        const game = games.find(game => game.competitions[0].competitors.some(competitor => competitor.team.abbreviation.toUpperCase() === team));
        if (game) {
            const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home').team.abbreviation;
            const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away').team.abbreviation;
            const gameTime = convertToEST(game.date).toLocaleString(luxon.DateTime.DATETIME_SHORT);
            results += `<p>Next game for ${team}: ${awayTeam} vs ${homeTeam} at ${gameTime}</p>`;
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

function convertToEST(dateString) {
    return luxon.DateTime.fromISO(dateString, { zone: 'America/New_York' });
}
