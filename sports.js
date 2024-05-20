async function getSportsScores() {
    const sportsOutput = document.getElementById('sports-output');
    sportsOutput.innerHTML = 'Fetching sports scores...';

    const leagues = {
        nfl: {
            name: 'NFL',
            teams: document.getElementById('nflTeams').value.split(',').map(team => team.trim().toUpperCase()),
            url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
        },
        nba: {
            name: 'NBA',
            teams: document.getElementById('nbaTeams').value.split(',').map(team => team.trim().toUpperCase()),
            url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
        },
        cfb: {
            name: 'College Football',
            teams: document.getElementById('cfbTeams').value.split(',').map(team => team.trim().toUpperCase()),
            url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard'
        },
        mcbb: {
            name: 'Men\'s College Basketball',
            teams: document.getElementById('mcbbTeams').value.split(',').map(team => team.trim().toUpperCase()),
            url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard'
        }
    };

    let results = '';
    const simplifiedJsonResults = [];

    for (const leagueKey in leagues) {
        const league = leagues[leagueKey];
        if (document.getElementById(leagueKey).checked) {
            const response = await fetch(league.url);
            const data = await response.json();
            const games = data.events;

            const leagueJson = {
                league: league.name,
                games: []
            };

            results += `<h3>${league.name}</h3>`;
            
            if (league.teams.length === 0 || (league.teams.length === 1 && league.teams[0] === '')) {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                games.forEach(game => {
                    const gameDate = game.date.split('T')[0];
                    if (gameDate === today) {
                        const homeTeam = game.competitions[0].competitors[0].team.abbreviation;
                        const awayTeam = game.competitions[0].competitors[1].team.abbreviation;
                        const gameTime = new Date(game.date).toLocaleString('en-US', { timeZone: 'America/New_York' });
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
                    } else if (gameDate === yesterdayStr) {
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
            } else {
                league.teams.forEach(team => {
                    const game = games.find(game => game.competitions[0].competitors.some(competitor => competitor.team.abbreviation.toUpperCase() === team));
                    if (game) {
                        const homeTeam = game.competitions[0].competitors[0].team.abbreviation;
                        const awayTeam = game.competitions[0].competitors[1].team.abbreviation;
                        const gameTime = new Date(game.date).toLocaleString('en-US', { timeZone: 'America/New_York' });
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
            }

            simplifiedJsonResults.push(leagueJson);
        }
    }

    sportsOutput.dataset.json = JSON.stringify(simplifiedJsonResults, null, 2);
    sportsOutput.dataset.formatted = results;
    sportsOutput.innerHTML = sportsOutput.dataset.formatted;
}

function toggleSports() {
    const sportsOptions = document.getElementById('sports-options');
    sportsOptions.style.display = sportsOptions.style.display === 'none' ? 'block' : 'none';
}

function toggleSportsView() {
    const sportsOutput = document.getElementById('sports-output');
    if (sportsOutput.innerHTML.trim() === sportsOutput.dataset.formatted.trim()) {
        sportsOutput.textContent = sportsOutput.dataset.json;
    } else {
        sportsOutput.innerHTML = sportsOutput.dataset.formatted;
    }
}
