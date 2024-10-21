import { soccerApiKey } from "./apiKeys.js";

const WORLD_CUP_LEAGUE_ID = 1;
const SEASON = 2022; // API is limited to only the most recent world cup (for free)

/*
1. grab ip -> country of the user
2. search for their country's team in the most recent world cup -> grab their team ID
3. #2 triggers grabbing team information from teams in the most recent world cup
4. if their team was in world cup, teamID is brough to displayTeamInfo
*/

document.querySelector('button').addEventListener('click', () => { // has to be anonymous arrow, otherwise gets run instantly
    getIpLocation() 
        .then(country => {
            if (country) {
                document.querySelector('h4').innerText = `Your location: ${country}`
                console.log(`Searching for team based on country: ${country}`);
                return searchForTeam(country);
            } else {
                console.log("Could not grab country from IP");
            }
        })
        .then(teamId => {
            if (teamId) {
                displayTeamInfo(teamId); 
            }
        })
        .catch(err => {
            console.log(`Error: ${err}`);
        });
});

// Function to get the user's country from IP location
function getIpLocation() {
    let urlIp = `http://ip-api.com/json/`;

    return fetch(urlIp)
        .then(res => res.json())
        .then(data => {
            if (data && data.country) {
                if (data.country === 'United States') {
                    return "USA"
                }
                return data.country; // Return the user's country
            } else {
                throw new Error("Unable to retrieve country from IP location");
            }
        })
        .catch(err => {
            console.log(`Error getting IP location: ${err}`);
            return null; // Return null if an error occurs
        });
}

// Function to fetch teams in the World Cup (one World Cup, should be modified if handling across multiple World Cups)
function getTeamsInWC() {
    let urlWCTeams = `https://v3.football.api-sports.io/teams?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}`;

    return fetch(urlWCTeams, {
        headers: { 'x-apisports-key': soccerApiKey }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`WC API teams collect error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // console.log(data.response)
        return data.response; // Return the array of objects to searchForTeam, each object being a team's info
    })
    .catch(err => {
        console.log(`Error fetching teams: ${err}`);
        return null; 
    });
}

// Function to take teamID found from all prior work to look up team's information, using soccer API again
function displayTeamInfo(teamId) {
    let urlTeamInfo = `https://v3.football.api-sports.io/teams/statistics?season=${SEASON}&league=${WORLD_CUP_LEAGUE_ID}&team=${teamId}`;

    fetch(urlTeamInfo, {
        headers: { 'x-apisports-key': soccerApiKey }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Error! Status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log(data); // log the team's statistics and info
        document.querySelector('img').src = data.response.team.logo
        // COME BACK TO
    })
    .catch(err => {
        console.log(`Error fetching team info: ${err}`);
    });
}

// Function to search for a team + their ID by the user's country
function searchForTeam(teamName) {
    return getTeamsInWC()
        .then(teams => {
            if (teams) {
                // Find the team by name
                const team = teams.find(t => t.team.name.toLowerCase() === teamName.toLowerCase());

                if (team) {
                    console.log(`Team found: ${team.team.name}, ID: ${team.team.id}`);
                    return team.team.id; // Return the team's ID --> displayTeamInfo
                } else {
                    console.log(`Team ${teamName} not found.`);
                    return null;
                }
            } else {
                console.log(`Error: Unable to fetch teams.`);
                return null;
            }
        })
        .catch(err => {
            console.log(`Error: ${err}`);
            return null;
        });
}

