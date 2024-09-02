const fs = require('fs');

// Inicijalizacija groupMatches objekta
let groupMatches = {};

fs.readFile('groups.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Greška prilikom čitanja fajla', err);
        return;
    }
    const groups = JSON.parse(data);

    // Inicijalizacija timova i groupMatches
    Object.keys(groups).forEach(group => {
        const teams = groups[group];
        teams.forEach(team => {
            team.points = 0;
            team.wins = 0;
            team.losses = 0;
            team.scoredPoints = 0;
            team.lostPoints = 0;
            team.pointDiffs = 0;

            groupMatches[team.Team] = [];
        });
    });

    // Simulacija tri kola grupne faze
    for (let round = 1; round <= 3; round++) {
        console.log(`Grupna faza - Kolo ${round}:`);

        Object.keys(groups).forEach(groupName => {
            const teams = groups[groupName];
            console.log(`    Grupa ${groupName}:`);

            // Rotacija parova timova za svako kolo
            const matches = [
                [teams[0], teams[1]], // Utakmica 1
                [teams[2], teams[3]]  // Utakmica 2
            ];

            if (round === 2) {
                matches[0] = [teams[0], teams[2]]; 
                matches[1] = [teams[1], teams[3]]; 
            } else if (round === 3) {
                matches[0] = [teams[0], teams[3]]; 
                matches[1] = [teams[1], teams[2]];  
            }

            // Simulacija utakmica u okviru kola
            matches.forEach(([team1, team2]) => {
                const matchResult = matchSimulation(team1, team2);

                groupMatches[team1.Team].push(team2.Team);
                groupMatches[team2.Team].push(team1.Team);
            });
        });
        console.log('\n');
    }

    // Konačan plasman u grupama
    console.log('Konačan plasman u grupama:');
    Object.keys(groups).forEach(groupName => {
        const teams = groups[groupName];

        // Sortiranje timova unutar grupe
        sortTeams(teams);

        console.log(`    Grupa ${groupName} (Ime - pobede/porazi/bodovi/postignuti koševi/primljeni koševi/koš razlika):`);
        teams.forEach((team, index) => {
            console.log(`        ${index + 1}. ${team.Team}  ${team.wins} / ${team.losses} / ${team.points} / ${team.scoredPoints} / ${team.lostPoints} / ${team.pointDiffs >= 0 ? '+' : ''}${team.pointDiffs}`);
        });
    });

    // Raspoređivanje u šešire
    const firstPlaceTeams = [];
    const secondPlaceTeams = [];
    const thirdPlaceTeams = [];

    Object.keys(groups).forEach(groupName => {
        const teams = groups[groupName];

        firstPlaceTeams.push(teams[0]);
        secondPlaceTeams.push(teams[1]);
        thirdPlaceTeams.push(teams[2]);
    });

    

    sortTeams(firstPlaceTeams);
    sortTeams(secondPlaceTeams);
    sortTeams(thirdPlaceTeams);

    firstPlaceTeams.forEach((team, index) => {
        team.rank = index + 1;
    });
    secondPlaceTeams.forEach((team, index) => {
        team.rank = index + 4;
    });
    thirdPlaceTeams.forEach((team, index) => {
        team.rank = index + 7;
    });

    // Provera da li imamo tačno devet timova nakon grupne faze
    const totalTeams = firstPlaceTeams.length + secondPlaceTeams.length + thirdPlaceTeams.length;
    if (totalTeams !== 9) {
        console.error(`Ukupan broj kvalifikovanih timova nije 9. Trenutno: ${totalTeams}`);
        return;
    }

    // Ekipe koje prolaze dalje
    const qualifiedTeams = [...firstPlaceTeams, ...secondPlaceTeams, ...thirdPlaceTeams].filter(team => team.rank <= 8);

    console.log("\nEkipe koje prolaze u eliminacionu fazu:");
    qualifiedTeams.forEach(team => {
        console.log(`${team.Team} - Rang: ${team.rank}`);
    });

    console.log("\nEkipa koja ne prolaze dalje:");
    const eliminatedTeam = thirdPlaceTeams.find(team => team.rank === 9);
    console.log(`${eliminatedTeam.Team} - Rang: ${eliminatedTeam.rank}`); 
   
   
    // Raspoređivanje u šešire
    const hatD = [qualifiedTeams[0], qualifiedTeams[1]];
    const hatE = [qualifiedTeams[2], qualifiedTeams[3]];
    const hatF = [qualifiedTeams[4], qualifiedTeams[5]];
    const hatG = [qualifiedTeams[6], qualifiedTeams[7]];

    // Funkcija za nasumično uparivanje timova, izbegavajući ponovne susrete
    function randomPairing(hat1, hat2, groupMatches) {
        let pairs =[];
        let teams1 = [...hat1];
        let teams2 = [...hat2];
        while (teams1.length > 0 && teams2.length > 0) {
            let i = 0;
            let j = 0;
            let pairFound = false;
    
            while (i < teams1.length && !pairFound) {
                while (j < teams2.length) {
                    if (!groupMatches[teams1[i].Team].includes(teams2[j].Team)) {
                        pairs.push([teams1[i], teams2[j]]);
                        // Uklanjanje timova iz niza
                        teams1.splice(i, 1);
                        teams2.splice(j, 1);
                        pairFound = true;
                        break;
                    }
                    j++;
                }
                j = 0; 
                i++;
            }
    
            if (!pairFound) {
                console.error("Nije moguće upariti timove bez ponovnih susreta.");
                break;
            }
        }
    
        return pairs;
        
    }

    // Formiranje parova četvrtfinala
    let quarterFinalPairs = [
        ...randomPairing(hatD, hatG, groupMatches),
        ...randomPairing(hatE, hatF, groupMatches)
    ];

    if (quarterFinalPairs.length !== 4) {
        console.error("Nije moguće formirati sve parove četvrtfinala bez ponovnih susreta.");
        return;
    }

    console.log("\nParovi četvrtfinala:");
    quarterFinalPairs.forEach(([team1, team2], index) => {
        console.log(`    Par ${index + 1}: ${team1.Team} vs ${team2.Team}`);
    });

    

    function simulateKnockoutRound(pairs) {
        let winners = [];
    
        pairs.forEach(([team1, team2]) => {
            const matchResult = matchSimulation(team1, team2);
            const winner = matchResult.winner;
            winners.push(winner);
            console.log("Pobednici:");
            console.log(winner.Team);
        });
    
        return winners;
    }
    
    function simulateEliminationPhase(quarterFinalPairs) {
        console.log('Četvrtfinale:');
        const semiFinalists = simulateKnockoutRound(quarterFinalPairs);
    
        console.log('\nPolufinale:');
        const semiFinalPairs = [
            [semiFinalists[0], semiFinalists[1]],
            [semiFinalists[2], semiFinalists[3]]
        ];
        const finalists = simulateKnockoutRound(semiFinalPairs);
    
       const lostInSemiFinals = semiFinalists.filter(team => !finalists.includes(team));

    // Utkamica za treće mesto
    console.log('\nUtakmica za treće mesto:');
    const thirdPlaceMatch = lostInSemiFinals;
    const thirdPlaceWinner = simulateKnockoutRound([thirdPlaceMatch])[0];

    console.log('\nFinale:');
    const finalMatch = [finalists[0], finalists[1]];
    const finalWinner = simulateKnockoutRound([finalMatch])[0];

    // Prikaz medalja
    console.log('\nMedalje:');
    console.log(`    1. ${finalWinner.Team}`);
    console.log(`    2. ${finalMatch.find(team => team !== finalWinner).Team}`);
    console.log(`    3. ${thirdPlaceWinner.Team}`);
    }
    
    // Na kraju simulacije grupne faze i formiranja parova za četvrtfinale, pozivamo funkciju:
    simulateEliminationPhase(quarterFinalPairs);
    return;
    
});

function teamStats(team) {
    console.log(`${team.Team}: ${team.points} poena, ${team.wins} pobeda, ${team.losses} poraza, ${team.scoredPoints} postignutih poena, ${team.lostPoints} primljenih poena, razlika: ${team.pointDiffs}`);
}

function matchSimulation(team1, team2) {

    let scoreDifferent = false;
    while(!scoreDifferent){
        var randomFactor = Math.random();
        var rankDifference = Math.abs(team1.FIBARanking - team2.FIBARanking);
        var winnerProbability = Math.random() + 0.05 * rankDifference;
    
    
        var betterScore = Math.round(60 + winnerProbability * 30);
        var autScore = Math.round(60 + randomFactor * 30);
        if(betterScore != autScore){
            scoreDifferent = true;
        }
    }
    
    let winner, loser;

    if (team1.FIBARanking > team2.FIBARanking && winnerProbability > randomFactor) {
        winner = team2;
        loser = team1;
        console.log(`        ${team1.Team} - ${team2.Team} (${autScore}:${betterScore})`);
        updateStats(winner, loser, betterScore, autScore);
    } else if (team2.FIBARanking > team1.FIBARanking && winnerProbability > randomFactor) {
        winner = team1;
        loser = team2;
        console.log(`        ${team1.Team} - ${team2.Team} (${betterScore}:${autScore})`);
        updateStats(winner, loser, betterScore, autScore);
    } else {
        if(team1.FIBARanking > team2.FIBARanking && winnerProbability <= randomFactor) { 
            winner = team1;
            loser = team2;
            console.log(`        ${team1.Team} - ${team2.Team} (${autScore}:${betterScore})`);
            updateStats(winner, loser, autScore, betterScore);
        }else{
            winner = team2;
            loser = team1;
            console.log(`        ${team1.Team} - ${team2.Team} (${betterScore}:${autScore})`);
            updateStats(winner, loser, autScore, betterScore);
        }

    }

    
    return { winner, loser };
}


function updateStats(winningTeam, losingTeam, winningPoints, losingPoints) {
    if (isNaN(winningPoints) || isNaN(losingPoints)) {
        console.error('Greška: Rezultati ne mogu biti NaN.');
        return;
    }

    winningTeam.points += 2;
    losingTeam.points += 1;
    winningTeam.wins += 1;
    losingTeam.losses += 1;

    winningTeam.scoredPoints += winningPoints;
    winningTeam.lostPoints += losingPoints;
    winningTeam.pointDiffs += (winningPoints - losingPoints);

    losingTeam.scoredPoints += losingPoints;
    losingTeam.lostPoints += winningPoints;
    losingTeam.pointDiffs += (losingPoints - winningPoints);
}

function sortTeams(teams) {
    teams.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        } else if (b.pointDiffs !== a.pointDiffs) {
            return b.pointDiffs - a.pointDiffs;
        } else {
            return b.scoredPoints - a.scoredPoints;
        }
    });
}