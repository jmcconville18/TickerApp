// Initialize apiCallCounterPGA if not already set
if (!window.apiCallCounterPGA) {
    window.apiCallCounterPGA = localStorage.getItem('apiCallCounterPGA') ? parseInt(localStorage.getItem('apiCallCounterPGA')) : 0;
}

// Define tour data for PGA Tour
const tourData = {
    tour_id: 2, // US PGA Tour ID
    season_id: 2024
};

async function getPGAScores() {
    const fixturesUrl = `https://golf-leaderboard-data.p.rapidapi.com/fixtures/${tourData.tour_id}/${tourData.season_id}`;
    const leaderboardUrl = 'https://golf-leaderboard-data.p.rapidapi.com/leaderboard/';
    const league = {
        name: 'PGA Tour'
    };

    let results = '';
    const simplifiedJsonResults = [];

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

    if (window.apiCallCounterPGA >= 50 && dayOfWeek >= 4 && dayOfWeek <= 7) {
        results = '<p>Daily API call limit reached. Showing cached data.</p>';
        const cachedLeaderboardData = JSON.parse(localStorage.getItem('cachedLeaderboardData'));
        if (cachedLeaderboardData) {
            return { formatted: cachedLeaderboardData.formatted, json: cachedLeaderboardData.json };
        } else {
            results += '<p>No cached data available.</p>';
            return { formatted: results, json: {} };
        }
    }

    try {
        let fixturesData;
        const lastFixturesFetch = new Date(localStorage.getItem('lastFixturesFetch'));
        const lastLeaderboardFetch = new Date(localStorage.getItem('lastLeaderboardFetch'));
        const cachedFixturesData = JSON.parse(localStorage.getItem('cachedFixturesData'));

        if (!cachedFixturesData || dayOfWeek === 1 || (today - lastFixturesFetch) / (1000 * 60 * 60 * 24) >= 7) {
            const fixturesResponse = await fetch(fixturesUrl, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'e6bc2a9333msh2c319566291e932p1ded96jsn259d04576919',
                    'X-RapidAPI-Host': 'golf-leaderboard-data.p.rapidapi.com'
                }
            });
            fixturesData = await fixturesResponse.json();
            localStorage.setItem('cachedFixturesData', JSON.stringify(fixturesData));
            localStorage.setItem('lastFixturesFetch', today.toISOString());
            console.log('Fetched new fixtures data');
        } else {
            fixturesData = cachedFixturesData;
            console.log('Used cached fixtures data');
        }

        window.apiCallCounterPGA++;
        localStorage.setItem('apiCallCounterPGA', window.apiCallCounterPGA);

        if (!fixturesData || !fixturesData.results) {
            results = '<p>Error fetching fixtures data.</p>';
            return { formatted: results, json: {} };
        }

        const currentDate = new Date();
        let previousTournament = null;
        let currentTournament = null;
        let nextTournament = null;

        fixturesData.results.forEach(tournament => {
            const tournamentStartDate = new Date(tournament.start_date);
            const tournamentEndDate = new Date(tournament.end_date);

            if (tournamentEndDate < currentDate) {
                previousTournament = tournament;
            } else if (tournamentStartDate <= currentDate && tournamentEndDate >= currentDate) {
                currentTournament = tournament;
            } else if (tournamentStartDate > currentDate && !nextTournament) {
                nextTournament = tournament;
            }
        });

        const leagueJson = {
            league: league.name,
            apiUrl: fixturesUrl,
            tournaments: {
                previous: previousTournament,
                current: currentTournament,
                next: nextTournament
            },
            games: [],
            apiCallCounter: window.apiCallCounterPGA
        };

        results += `<h3>${league.name}</h3>`;
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
        };
        const formatPurse = (purse) => {
            return `$${parseFloat(purse.replace(/,/g, '')).toLocaleString()}`;
        };

        if (previousTournament) {
            results += `<p>Previous Tournament: ${previousTournament.name} (${formatDate(previousTournament.start_date)} - ${formatDate(previousTournament.end_date)})</p>`;
            results += `<p>Purse: ${formatPurse(previousTournament.prize_fund)}</p>`;
        }
        if (currentTournament) {
            results += `<p>Current Tournament: ${currentTournament.name} (${formatDate(currentTournament.start_date)} - ${formatDate(currentTournament.end_date)})</p>`;
            results += `<p>Purse: ${formatPurse(currentTournament.prize_fund)}</p>`;
        }
        if (nextTournament) {
            results += `<p>Next Tournament: ${nextTournament.name} (${formatDate(nextTournament.start_date)} - ${formatDate(nextTournament.end_date)})</p>`;
            results += `<p>Purse: ${formatPurse(nextTournament.prize_fund)}</p>`;
        }

        // Fetch leaderboard for the appropriate tournament
        let leaderboardTournament = currentTournament ? currentTournament : previousTournament;
        if (leaderboardTournament) {
            let leaderboardData;

            if (!localStorage.getItem('cachedLeaderboardData') || dayOfWeek === 1 || (today - lastLeaderboardFetch) / (1000 * 60 * 60 * 24) >= 3 || (dayOfWeek >= 4 && dayOfWeek <= 7 && window.apiCallCounterPGA <= 50)) {
                const leaderboardResponse = await fetch(`${leaderboardUrl}${leaderboardTournament.id}`, {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': 'e6bc2a9333msh2c319566291e932p1ded96jsn259d04576919',
                        'X-RapidAPI-Host': 'golf-leaderboard-data.p.rapidapi.com'
                    }
                });
                leaderboardData = await leaderboardResponse.json();
                localStorage.setItem('cachedLeaderboardData', JSON.stringify(leaderboardData));
                localStorage.setItem('lastLeaderboardFetch', today.toISOString());
                console.log('Fetched new leaderboard data');
            } else {
                leaderboardData = JSON.parse(localStorage.getItem('cachedLeaderboardData'));
                console.log('Used cached leaderboard data');
            }

            if (leaderboardData && leaderboardData.results && leaderboardData.results.leaderboard) {
                const isTournamentCurrent = Boolean(currentTournament);
                leaderboardData.results.leaderboard.slice(0, isTournamentCurrent ? 10 : 5).forEach((player, index) => {
                    const playerName = `${player.first_name} ${player.last_name}`;
                    const playerScore = player.total_to_par;
                    const playerHoles = player.holes_played;
                    results += `<p>${playerName}: ${playerScore} ${isTournamentCurrent ? `(Holes completed: ${playerHoles})` : ''}</p>`;
                    leagueJson.games.push({
                        player: playerName,
                        score: playerScore,
                        holes: playerHoles,
                        status: isTournamentCurrent ? 'current' : 'completed'
                    });
                });
            } else {
                results += `<p>No leaderboard data found.</p>`;
            }
        }

        return { formatted: results, json: leagueJson };

    } catch (error) {
        results = `<p>Error fetching PGA Tour scores: ${error.message}</p>`;
        console.error(error);
        return { formatted: results, json: {} };
    }
}
