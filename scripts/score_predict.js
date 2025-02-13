function predictScores1() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("1v1 Matchups");
  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();
  
  var featuresHOME = [];
  var featuresOPP = [];
  var scoresHOME = [];
  var scoresOPP = [];
  var HOMEsumOffensivePlays =0;
  var OPPsumOffensivePlays =0;
  var homeadvantage = 0.2; // CAN ADJUST
  var HOMEsumTDs = 0;
  var OPPsumTDs = 0;

  var HOMEpastOpponentRank = 0;
  var HOMEvalidGames = 0; // # valid FBS games
  var OPPpastOpponentRank = 0;
  var OPPvalidGames = 0; // # valid FBS games

  hometeam = ("UVA");
  var HOMEsumkickingPoints = 85;
  opponent = ("BC");
  var OPPsumkickingPoints = 94;
  
  // Extract features and scores/targets
  for (var i = 1; i < data.length; i++) {

    var row = data[i];
    var team = row[2];
    var result = row[4];
    var touchdowns = row[9]+row[13];
    var offensiveplays = row[14];
    var pastopponents = row[3];
    var stats = row.slice(5, 26);
    var scores = extractScores1(result);
    
    if (team === hometeam) {
      featuresHOME.push(stats);
      scoresHOME.push(scores.score);
      HOMEsumOffensivePlays += offensiveplays;
      HOMEsumTDs += touchdowns;
      var rank = getFbsRanking(pastopponents);  // Get the FBS ranking of previous opponents

      if (rank !== null) {  // Check if the ranking is valid (not null)
        HOMEpastOpponentRank += rank;  // Add the rank to the total
        HOMEvalidGames++  // Count this as a valid game
      }

    } else if (team === opponent) {
      featuresOPP.push(stats);
      scoresOPP.push(scores.score);
      OPPsumOffensivePlays += offensiveplays;
      OPPsumTDs += touchdowns;
      var rank = getFbsRanking(pastopponents);  // Get the FBS ranking of the opponent
      if (rank !== null) {  // Check if the ranking is valid (not null)
        OPPpastOpponentRank += rank;  // Add the rank to the total
        OPPvalidGames++  // Count this as a valid game
      }
    }
  }

  // Calculate game tempo adjustment based on offensive plays
  var HOMEavgPlays = HOMEsumOffensivePlays / HOMEvalidGames;
  var OPPavgPlays = OPPsumOffensivePlays / OPPvalidGames;
  var HOMEpastOpponentRankavg = HOMEpastOpponentRank / HOMEvalidGames;
  var OPPpastOpponentRankavg = OPPpastOpponentRank / OPPvalidGames;

  // Logger.log(HOMEpastOpponentRankavg);
  // Logger.log(OPPpastOpponentRankavg);

  if (featuresHOME.length !== scoresHOME.length && featuresOPP.length !== scoresOPP.length) {
    Logger.log('Features and Targets lengths do not match.');
    return;
  }

  // Check if features and targets are defined and non-empty
  if (featuresHOME.length === 0 || featuresOPP.length === 0 || scoresHOME.length === 0 || scoresOPP.length === 0) {
    Logger.log('Features or Targets are empty.');
    return;
  }

  var HOMEStrength = calculateStrength1(featuresHOME, HOMEvalidGames, HOMEsumkickingPoints, HOMEsumTDs, HOMEpastOpponentRankavg);
  var OPPStrength = calculateStrength1(featuresOPP, OPPvalidGames, OPPsumkickingPoints, OPPsumTDs, OPPpastOpponentRankavg);

  var predictedHomeScore = applyScoreBias1(predictNextScore1(scoresHOME, HOMEavgPlays, HOMEStrength));
  var predictedOppScore = applyScoreBias1(predictNextScore1(scoresOPP, OPPavgPlays, OPPStrength));
  
  var predictedHomeScore_final = applyScoreBias1(predictNextScore1(scoresHOME, HOMEavgPlays, HOMEStrength, OPPStrength) + ((homeadvantage) * calculateStandardDeviation(scoresHOME)));
  var predictedOppScore_final = applyScoreBias1(predictNextScore1(scoresOPP, OPPavgPlays, OPPStrength, HOMEStrength) - ((homeadvantage) * calculateStandardDeviation(scoresOPP)));
  
  Logger.log('Predicted ' + hometeam + ' Score: ' + Math.round(predictedHomeScore));
  Logger.log('Predicted ' + opponent + ' Score: ' + Math.round(predictedOppScore));
  Logger.log('Final Predicted ' + hometeam + ' Score: ' + Math.round(predictedHomeScore_final));
  Logger.log('Final Predicted ' + opponent + ' Score: ' + Math.round(predictedOppScore_final));

}

function getFbsRanking(teamName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("FBS Ranking");
  var data = sheet.getRange(1, 1, sheet.getLastRow(), 3).getValues();  // Get rankings and team names

  for (var i = 0; i < data.length; i++) {
    var school = data[i][2];  // Column 3 contains school names
    var rank = data[i][0];    // Column 1 contains the ranking

    if (school === teamName) {
      return rank;  // Return the rank if team name matches
    }
  }
  return null;  // Return null if the team is not found in FBS rankings
}


function calculateStrength1(features, validGames, sumKickingPoints, sumTDs, pastOpponentRankavg) {
  // Simple strength calculation based on average yards per game and kicking points
  var totalYards = features.reduce((sum, game) => sum + game[3] + game[6], 0);  // Assuming columns 3 and 6 are passing and rushing yards
  var avgYards = totalYards / validGames;
  var avgKickingPoints = sumKickingPoints / validGames;  // Average kicking points
  var avgTDs = (sumTDs) / validGames;
  
  var strength = avgTDs*0.45/3.1 + avgYards*0.45/380 + avgKickingPoints*0.1/7 + (50-pastOpponentRankavg)/134; // 134 FBS teams
  // 350 is an approximate league average for total yards per game, 6.5 is the average for kicking points per game, 3.1 is TD per game
  //Logger.log('Calculated strength with kicking points: ' + strength);
  return strength;
}

function predictNextScore1(scores, avgPlays, otherteamstrength) {
  var avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  // Logger.log('Average Score: ' + avgScore);
  // Logger.log('Standard Deviation: ' + stdDev);

  // Use recent trend (last 3 games)
  var recentScores = scores.slice(-3);
  var recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  
  // Logger.log('Recent Average Score: ' + recentAvg);

  // Combine overall average and recent average
  var combinedAvg = (avgScore + recentAvg) / 2;

  // Adjust for opponent strength
  var strengthAdjustedScore = combinedAvg / otherteamstrength;
  
  // Logger.log('Strength Adjusted Score: ' + strengthAdjustedScore);

  // Adjust for game tempo
  var tempoFactor = avgPlays / 60;  // Assuming 65 is an average number of plays
  var finalScore = strengthAdjustedScore * tempoFactor;
  return finalScore;
}

function calculateStandardDeviation(values) {
  var avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  var squareDiffs = values.map(value => Math.pow(value - avg, 2));
  var avgSquareDiff = squareDiffs.reduce((sum, value) => sum + value, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

function applyScoreBias1(prediction) {
  // Most common football scores (based on touchdowns and field goals)
  var commonScores = [7, 10, 13, 14, 17, 20, 21, 24, 27, 28, 31, 34, 35, 38, 41, 42, 45];
  
  // Find the nearest common score
  var nearestScore = commonScores.reduce((prev, curr) => 
    Math.abs(curr - prediction) < Math.abs(prev - prediction) ? curr : prev
  );

  // Apply a bias factor
  var biasFactor = 0.2;  // Adjust this value to control the strength of the bias
  return prediction * (1 - biasFactor) + nearestScore * biasFactor;
}

function extractScores1(result) {
  var match = result.match(/([0-9]+)-([0-9]+)/);
  if (match) {
    return {score: parseInt(match[1])};  // Return only the first number
  } else {
    return 0;  // Default value if the format is not matched
  }
}