let apiCallCounterPGA = localStorage.getItem('apiCallCounterPGA') ? parseInt(localStorage.getItem('apiCallCounterPGA')) : 0;

async function getPGAScores() {
    const toursUrl = 'https://golf-leaderboard-data.p.rapidapi.com/tours';
    const fixturesUrl = 'https://golf-leaderboard-data.p.rapidapi.com/fixtures/';
    const leaderboardUrl = 'https://golf-leaderboard-data.p.rapidapi.com/leaderboard/';
    const league = {
        name: 'PGA Tour'
    };

    let results = '';
    const simplifiedJsonResults = [];

    if (apiCallCounterPGA >= 200) {
        results = '<p>API call limit reached. Please try again later.</p>';
        return { formatted: results, json: {} };
    }

    try {
        // Fetch tours
        const toursResponse = await fetch(toursUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'e6bc2a9333msh2c319566291e932p1ded96jsn259d04576919',
                'X-RapidAPI-Host': 'golf-leaderboard-data.p.rapidapi.com'
            }
        });
        const toursData = await toursResponse.json();
        console.log('Tours Data:', toursData);

        if (!toursData || !toursData.results) {
            results = '<p>Error fetching tours data.</p>';
            return { formatted: results, json: {} };
        }

        const pgaTour = toursData.results.find(tour => tour.tour_name === 'US PGA Tour' && tour.season_id === 2024);

        if (!pgaTour) {
            results = '<p>PGA Tour data not found.</p>';
            return { formatted: results, json: {} };
        }

        // Fetch fixtures for PGA Tour
        const fixturesResponse = await fetch(`${fixturesUrl}${pgaTour.tour_id}/${pgaTour.season_id}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'e6bc2a9333msh2c319566291e932p1ded96jsn259d04576919',
                'X-RapidAPI-Host': 'golf-leaderboard-data.p.rapidapi.com'
            }
        });
        const fixturesData = await fixturesResponse.json();
        console.log('Fixtures Data:', fixturesData);

        apiCallCounterPGA++;
        localStorage.setItem('apiCallCounterPGA', apiCallCounterPGA);

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
            apiCallCounter: apiCallCounterPGA
        };

        results += `<h3>${league.name}</h3>`;
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
        };
        const formatPurse = (purse) => {
            return `$${parseFloat(purse).toLocaleString()}`;
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
            const leaderboardResponse = await fetch(`${leaderboardUrl}${leaderboardTournament.id}`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': 'e6bc2a9333msh2c319566291e932p1ded96jsn259d04576919',
                    'X-RapidAPI-Host': 'golf-leaderboard-data.p.rapidapi.com'
                }
            });
            const leaderboardData = await leaderboardResponse.json();
            console.log('Leaderboard Data:', leaderboardData);

            if (leaderboardData.results && leaderboardData.results.leaderboard) {
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
