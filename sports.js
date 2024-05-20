document.addEventListener('DOMContentLoaded', loadSportsPreferences);

function saveSportsPreferences() {
    const leagues = ['nfl', 'nba', 'cfb', 'mcbb', 'mma', 'boxing', 'pga'];
    const preferences = {};

    leagues.forEach(league => {
        preferences[league] = {
            selected: document.getElementById(league).checked,
            teams: document.getElementById(league + 'Teams') ? document.getElementById(league + 'Teams').value : ''
        };
    });

    localStorage.setItem('sportsPreferences', JSON.stringify(preferences));
}

function loadSportsPreferences() {
    const preferences = JSON.parse(localStorage.getItem('sportsPreferences')) || {
        nfl: { selected: false, teams: '' },
        nba: { selected: false, teams: '' },
        cfb: { selected: false, teams: '' },
        mcbb: { selected: false, teams: '' },
        mma: { selected: false, teams: '' },
        boxing: { selected: false, teams: '' },
        pga: { selected: false, teams: '' }
    };

    Object.keys(preferences).forEach(league => {
        document.getElementById(league).checked = preferences[league].selected;
        if (document.getElementById(league + 'Teams')) {
            document.getElementById(league + 'Teams').value = preferences[league].teams;
        }
    });
}

function convertToEST(dateString) {
    return luxon.DateTime.fromISO(dateString, { zone: 'utc' }).setZone('America/New_York');
}

async function getSportsScores() {
    saveSportsPreferences();

    const sportsOutput = document.getElementById('sports-output');
    sportsOutput.innerHTML = 'Fetching sports scores...';

    let results = '';
    const simplifiedJsonResults = [];

    // Load league-specific scripts
    await loadScript('sportsNFL.js');
    await loadScript('sportsNBA.js');
    await loadScript('sportsCFB.js');
    await loadScript('sportsMCBB.js');
    await loadScript('sportsMMA.js');
    await loadScript('sportsBoxing.js');
    await loadScript('sportsPGA.js');

    const leagues = ['nfl', 'nba', 'cfb', 'mcbb', 'mma', 'boxing', 'pga'];
    for (const leagueKey of leagues) {
        if (document.getElementById(leagueKey).checked) {
            const leagueResults = await window[`get${leagueKey.toUpperCase()}Scores`]();
            results += leagueResults.formatted;
            simplifiedJsonResults.push(leagueResults.json);
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

async function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
