
/*
* Methods for tennis tournament
* Functionality: create groups based on input, generate matches for the groups, create playoffs
*/

function clearAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Group");
  
  // clear all
  sheet.getRange("A1:W27").clearContent();

  // group headers
  sheet.getRange("C3").setValue("Grupp A");
  sheet.getRange("H3").setValue("Grupp B");
  sheet.getRange("M3").setValue("Grupp C");
  sheet.getRange("R3").setValue("Grupp D");
}

function createGroups() {
  // this method will also shuffle

  // get spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var inputSheet = ss.getSheetByName("Inputs");
  var groupSheet = ss.getSheetByName("Group");


  // fix group D table border?
  // groupSheet.getRange("R3:U3").clearContent();
  // Define the merged range for Group D
  var r = groupSheet.getRange("R3:U3");

  // first clear matches
  groupSheet.getRange("C9:U25").clearContent();

  // Get players from 'Inputs' sheet
  var playersRange = inputSheet.getRange("A1:A16");
  var players = playersRange.getValues().filter(function(row) {
    return row[0] !== "";  // Filter out empty cells
  }).flat();

  // Shuffle the array of players
  for (var i = players.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = players[i];
    players[i] = players[j];
    players[j] = temp;
  }

  // List of columns for each group
  var groupColumns = ['C', 'H', 'M', 'R'];

  // Clear the existing data in groups
  groupColumns.forEach(function(colLetter) {
    var colNumber = getColumnNumber(colLetter);
    groupSheet.getRange(4, colNumber, 4, 1).clearContent();
  });

  // Distribute players to groups as evenly as possible
  var numGroups = groupColumns.length;
  var basePlayersPerGroup = Math.floor(players.length / numGroups);
  var extraPlayers = players.length % numGroups;
  var playerIndex = 0;

  groupColumns.forEach(function(colLetter) {
    var colNumber = getColumnNumber(colLetter);
    var playersInThisGroup = basePlayersPerGroup + (extraPlayers > 0 ? 1 : 0);
    if (extraPlayers > 0) extraPlayers--;

    for (var row = 4; row < 4 + playersInThisGroup && playerIndex < players.length; row++) {
      groupSheet.getRange(row, colNumber).setValue(players[playerIndex]);
      playerIndex++;
    }
  });
}


function getColumnNumber(colLetter) {
  // Helper function to convert a column letter to its numerical index
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(colLetter + '1').getColumn();
}

function genMatches() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Group"); 


  // first clear matches
  sheet.getRange("C9:U25").clearContent();

  var groupColumns = {
    'A': 'C', // Matches for Group A in column B
    'B': 'H', // Matches for Group B in column G
    'C': 'M', // Matches for Group C in column L
    'D': 'R'  // Matches for Group D in column Q
  };

  for (var groupName in groupColumns) {
    var col = groupColumns[groupName];
    // Get players from the sheet for each group
    var playerValues = sheet.getRange(col + "4:" + col + "7").getValues();
    var players = playerValues.flat().filter(function(name) { return name !== ""; });

    // Check if there are exactly 4 players
    if (players.length === 3) {
      genMatchesForThreePlayers(sheet, col, players);
    } else if (players.length !== 4) {
      SpreadsheetApp.getUi().alert("Please ensure there are exactly 4 or 3 players in group " + groupName + ".");
      continue; // Skip to the next group if not 4 or 3 players
    } else {
      // Generate the match schedule for 4 players
      genMatchesForFourPlayers(sheet, col, players);
    }
  }
}

function genMatchesForFourPlayers(sheet, col, players) {
  // Generate the match schedule for 4 players
  var matches = [
    [players[0], players[1]], // Match 1
    [players[2], players[3]], // Match 2
    [players[0], players[2]], // Match 3
    [players[1], players[3]], // Match 4
    [players[0], players[3]], // Match 5
    [players[1], players[2]]  // Match 6
  ];

  // Schedule the matches in the sheet
  var startingRow = 9; // Start writing from row 8
  for (var i = 0; i < matches.length; i++) {
    var matchRow = startingRow + 3 * i; // Skip 1 row after each match
    sheet.getRange(col + matchRow).setValue(matches[i][0]);
    sheet.getRange(col + (matchRow + 1)).setValue(matches[i][1]);
  }
}

function genMatchesForThreePlayers(sheet, col, players) {
  // Generate the match schedule for 3 players
  var matches = [
    [players[0], players[1]], // Match 1
    [players[1], players[2]], // Match 2
    [players[2], players[0]]  // Match 3
  ];

  // Schedule the matches in the sheet
  var startingRow = 9; // Start writing from row 8
  for (var i = 0; i < matches.length; i++) {
    var matchRow = startingRow + 3 * i; // Skip 1 row after each match
    sheet.getRange(col + matchRow).setValue(matches[i][0]);
    sheet.getRange(col + (matchRow + 1)).setValue(matches[i][1]);
  }
}


function sortGroups() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var startCol = 4;
  var dist = 5;

  // Sort A group
  var range = sheet.getRange("C4:F7");
  range.sort({column: startCol, ascending: false})

  // // Sort B group
  var range2 = sheet.getRange("H4:K7");
  range2.sort({column: startCol + dist, ascending: false})

  // // Sort C group
  var range3 = sheet.getRange("M4:P7");
  range3.sort({column: startCol + dist * 2, ascending: false})

  // // Sort D group
  var range4 = sheet.getRange("R4:U7");
  range4.sort({column: startCol + dist * 3, ascending: false})
}

function onEdit(e) {
  // var sheet = e.source.getActiveSheet();
  // var startRow = 8; // Starting row for matches
  // var numMatches = 6; // Number of matches per group

  // var groups = [
  //   { nameColumn: 2, firstScoreColumn: 3, lastScoreColumn: 5 }, // Group A
  //   { nameColumn: 7, firstScoreColumn: 8, lastScoreColumn: 10 }, // Group B
  //   { nameColumn: 12, firstScoreColumn: 13, lastScoreColumn: 15 }, // Group C
  //   { nameColumn: 17, firstScoreColumn: 18, lastScoreColumn: 20 }  // Group D
  // ];

  // // Loop through each group
  // groups.forEach(function(group) {
  //   // Loop through each match in the group
  //   for (var i = 0; i < numMatches; i++) {
  //     var matchRow = startRow + 3 * i; // Matches are every 3 rows starting from row 8

  //     var player1NameCell = sheet.getRange(matchRow, group.nameColumn);
  //     var player2NameCell = sheet.getRange(matchRow + 1, group.nameColumn);
  //     var player1Wins = 0;
  //     var player2Wins = 0;

  //     // Loop through each set
  //     for (var j = 0; j < (group.lastScoreColumn - group.firstScoreColumn + 1); j++) {
  //       var player1Score = sheet.getRange(matchRow, group.firstScoreColumn + j).getValue();
  //       var player2Score = sheet.getRange(matchRow + 1, group.firstScoreColumn + j).getValue();

  //       if (player1Score > player2Score) {
  //         player1Wins++;
  //       } else if (player2Score > player1Score) {
  //         player2Wins++;
  //       }
  //     }

  //     // Determine the winner and make their name bold
  //     if (player1Wins >= 2) {
  //       player1NameCell.setFontWeight('bold');
  //       player2NameCell.setFontWeight('normal');
  //     } else if (player2Wins >= 2) {
  //       player2NameCell.setFontWeight('bold');
  //       player1NameCell.setFontWeight('normal');
  //     } else {
  //       // In case of a tie or no winner yet
  //       player1NameCell.setFontWeight('normal');
  //       player2NameCell.setFontWeight('normal');
  //     }
  //   }
  // });
}

function createPlayoffs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var groupSheet = ss.getSheetByName("Group"); // Assuming the sheet name is 'Group'
  var playoffsSheet = ss.getSheetByName("Playoffs");

  // Get players from group A and group B
  var groupA = groupSheet.getRange("C4:C7").getValues().flat();
  var groupB = groupSheet.getRange("H4:H7").getValues().flat();
  var groupC = groupSheet.getRange("M4:M7").getValues().flat();
  var groupD = groupSheet.getRange("R4:R7").getValues().flat();

  // Create A quarterfinals
  setPlayoffMatch("C3", groupA[0], groupB[1]);
  setPlayoffMatch("C6", groupB[0], groupA[1]);
  setPlayoffMatch("C9", groupC[0], groupD[1]);
  setPlayoffMatch("C12", groupD[0], groupC[1]);

  // Create B quarterfinals
  setPlayoffMatch("C17", groupA[2], groupB[3]);
  setPlayoffMatch("C20", groupB[2], groupA[3]);
  setPlayoffMatch("C23", groupC[2], groupD[3]);
  setPlayoffMatch("C26", groupD[2], groupC[3]);
}

function setPlayoffMatch(cell1, player1, player2) {
  // set playoff match players
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Playoffs");
  sheet.getRange(cell1).setValue(player1);
  sheet.getRange(cell1).offset(1, 0).setValue(player2);
}
