const fs = require('fs'); //smestanje funkcionalnosti za obradu fajla, unesenje modula koji pruza read, print, create, delete file...

let groupMatches = {};

fs.readFile("group.json", "utf8", (err,data=>{

    if(err){
        console.error("Greska prilikom citanja fajla");
        return;
    }
    const groups = JSON.parse(data);

    Object.keys(groups).forEach(group=>{
        const teams = groups[group];
        teams.forEach(team=>{
            team.points = 0;
            team.wins = 0;
            team.losses = 0;
            team.scoredPoints = 0;
            team.lostPoints = 0;
            team.pointDiffs = 0;

            groupMatches[team.Team] = [];
        })
    })

    for(let round = 1;round <= 3;round++){
        console.log(`Grupna faza - Kolo ${round}`);
        Object.keys(groups).forEach(groupName=>{
            const teams = groups[groupName];
            console.log(`   Grupa ${groupName}`);

            const matches = [
                [teams[0], teams[1]],
                [teams[2], teams[3]],
            ];

            if(round == 2){
                matches[0] = [teams[0], teams[2]];
                matches[1] = [teams[1], teams[3]];
            }
            else if(round == 3){
                matches[0] = [teams[0], teams[3]];
                matches[1] = [teams[1], teams[2]];
            }

            matches.forEach(([team1,team2])=>{
                const matchResult = matchSimulation(team1,team2);

                groupMatches[team1.Team].push(team2.Team);
                groupMatches[team2.Team].push(team1.Team);
            });

        });
        console.log('\n');
    }


}))

function matchSimulation(team1,team2){
    const randomFactor = Math.random();
}
