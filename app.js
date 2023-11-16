const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbpath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const InitializeAndStartServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`dberror : ${e.message}`);
    process.exit(1);
  }
};
InitializeAndStartServer();

const convertDbObjectToResponseObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

//API GET

app.get("/players/", async (request, response) => {
  const playersList = `
        select *
        from player_details
    `;
  const playersArray = await db.all(playersList);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerList = `
        SELECT
           *
        FROM 
          player_details
        WHERE 
          player_id = ${playerId};`;
  const players = await db.get(playerList);
  response.send(convertDbObjectToResponseObject(players));
});

//API PUT
app.put("/players/:playerId/", async (request, response) => {
  const { playerName } = request.body;
  const { playerId } = request.params;
  const updatePlayerDetails = `
        UPDATE
          player_details
        SET
         player_name = '${playerName}'
        WHERE
         player_id = ${playerId};`;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

const convertDbObjectToResponseObject1 = (object) => {
  return {
    matchId: object.match_id,
    match: object.match,
    year: object.year,
  };
};

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchList = `
        SELECT
           *
        FROM 
          match_details
        WHERE 
          match_id = ${matchId};`;
  const match = await db.get(matchList);
  response.send(convertDbObjectToResponseObject1(match));
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const matchList = `
        SELECT
           *
        FROM 
         player_match_score natural join match_details
        WHERE 
          player_id = ${playerId};`;
  const match = await db.all(matchList);
  response.send(match.map((each) => convertDbObjectToResponseObject1(each)));
});

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const playerList = `
        SELECT
           *
        FROM 
         player_match_score natural join player_details
        WHERE 
          match_id = ${matchId};`;
  const players = await db.all(playerList);
  response.send(players.map((each) => convertDbObjectToResponseObject(each)));
});

const convertDbObjectToResponseObject2 = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    totalScore: object.score,
    totalFours: object.fours,
    totalSixes: object.sixes,
  };
};

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const matchList = `
        SELECT
           player_id as player_id,
           player_name as player_name,
           SUM(score) as score,
           SUM(fours) as fours,
           SUM(sixes) as sixes
        FROM 
          player_match_score natural join player_details
        WHERE 
          player_id = ${playerId};`;
  const match = await db.get(matchList);
  response.send(convertDbObjectToResponseObject2(match));
});

module.exports = app;
