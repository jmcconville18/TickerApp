let apiCallCounter = localStorage.getItem('apiCallCounter') ? parseInt(localStorage.getItem('apiCallCounter')) : 0;

async function getPGAScores() {
    const toursUrl = 'https://golf-leaderboard-data.p.rapidapi.com/tours';
    const league = {
        name: 'PGA Tour',
        leaderboardUrl: 'https://golf-leaderboard-data.p.rapidapi.com/leaderboard/'
    };

    let results = '';
    const simplifiedJsonResults = [];

    if (apiCallCounter >= 200) {
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

        // Find the US PGA Tour for the latest year
        const pgaTour = toursData.results.find(tour => tour.tour_name === 'US PGA Tour' && tour.season_id === 2024);

        if (!pgaTour) {
            results = '<p>PGA Tour data not found.</p>';
            return { formatted: results, json: {} };
        }

        // Fetch leaderboard using tour ID
        const leaderboardUrl = `${league.leaderboardUrl}${pgaTour.tour_id}`;
        const leaderboardResponse = await fetch(leaderboardUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'e6bc2a9333msh2c319566291e932p1ded96jsn259d04576919',
                'X-RapidAPI-Host': 'golf-leaderboard-data.p.rapidapi.com'
            }
        });
        const leaderboardData = await leaderboardResponse.json();

        apiCallCounter++;
        localStorage.setItem('apiCallCounter', apiCallCounter);

        const leagueJson = {
            league: league.name,
            apiUrl: leaderboardUrl,
            games: [],
            apiCallCounter: apiCallCounter
        };

        results += `<h3>${league.name}</h3>`;

        if (leaderboardData.leaderboard) {
            const currentEventName = leaderboardData.event.name;
            results += `<p>Current Event: ${currentEventName}</p>`;
            leagueJson.games.push({
                event: currentEventName,
                status: 'current'
            });

            leaderboardData.leaderboard.forEach((player, index) => {
                if (index < 10) {
                    const playerName = player.name;
                    const playerScore = player.totalScore;
                    const playerHoles = player.holesCompleted;

                    results += `<p>${playerName}: ${playerScore} (Holes: ${playerHoles})</p>`;
                    leagueJson.games.push({
                        player: playerName,
                        score: playerScore,
                        holes: playerHoles,
                        status: 'current'
                    });
                }
            });
        } else {
            results += `<p>No current event found.</p>`;
        }

        return { formatted: results, json: leagueJson };

    } catch (error) {
        results = `<p>Error fetching PGA Tour scores: ${error.message}</p>`;
        console.error(error);
        return { formatted: results, json: {} };
    }
}
