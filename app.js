//inizializzo il server express che verrà usato per le richieste di file tra client e server (le pagine e le foto)
var express = require("express");
var app = express();
var server = require("http").createServer(app);

const {
  playerJoin,
  getCurrentPlayerById,
  getCurrentPlayerByUsername,
  playerLeave,
  getTablePlayer,
} = require("./utils/players");

const {
  estrazioneCasuale,
  initGame,
  makeDeck,
  ordinaMano,
  avanzaPosti,
} = require("./utils/gameLoopFunctions");

//in questo modo non vengono processate query che richiedono le risorse a /server
//se la query è nulla viene richiamara la funzione
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

//se la query è con client viene mandata la risorsa
app.use("../client", express.static(__dirname + "/client"));
server.listen(8081, () => console.log("server started"));

//inizializzo sockert.io che andrà inserito anche dentro l'index.html
var io = require("socket.io")(server, {});

io.on("connection", (socket) => {
  //join table
  socket.on("joinTable", ({ username, table }) => {
    currentPlayers = getTablePlayer(table);
    var controllo = 0;
    //controllo che il tavolo non sia pieno
    if (currentPlayers.length < 4) {
      //controllo che lo username nel tavolo non sia gia usato
      for (var i = 0; i < currentPlayers.length; i++) {
        if (username == currentPlayers[i].username) {
          controllo = 1;
          socket.emit("connectionError", {
            error: "username già usato nel tavolo",
          });
          break;
        }
      }
      if (!controllo) {
        const player = playerJoin(socket.id, username, table);
        console.log("IL PLAYER SI E' COLLEGATO \n", player.id);
        socket.join(player.table);

        io.to(player.table).emit("tablePlayers", {
          table: player.table,
          players: getTablePlayer(player.table),
        });
      }
    } else {
      socket.emit("connectionError", {
        error: "il tavolo è pieno",
      });
    }
  });

  //default disconnect when a player leaves the page
  socket.on("disconnect", () => {
    const player = playerLeave(socket.id);
    if (player) {
      // send users and room info
      io.to(player.table).emit("tablePlayers", {
        table: player.table,
        players: getTablePlayer(player.table),
      });
    }
  });

  //a player can change his team before the game
  socket.on("changeTeam", ({ username }) => {
    player = getCurrentPlayerByUsername(username);
    if (player.team == 0) {
      player.team = 1;
    } else {
      player.team = 0;
    }

    io.to(player.table).emit("tablePlayers", {
      table: player.table,
      players: getTablePlayer(player.table),
    });
  });

  //starts the game
  socket.on("initGame", ({ username, table }) => {
    var players = getTablePlayer(table);
    if (players.length == 4) {
      players = initGame(players, io);
      io.to(players[0].table).emit("gameIsStarting");
      giocaMano(players, 0, 0);
    }
  });
});

var giocaMano = function (players, puntiPrimoTeam, puntiSecondoTeam) {
  var mazzo = makeDeck();
  //mischio il mazzo
  var numeri = estrazioneCasuale();

  //lista con tutti le mani
  var mani = [];

  var mano = [];

  var prese1 = [];
  var prese2 = [];

  var scope1 = [];
  var scope2 = [];

  var campo = [];

  //se 1 è la prma squadra se 2 la seconda...per decidere a chi dare le carte in campo
  var ultimaPresa = 0;

  var contatoreTurno = 1;

  //ASSEGNO LA MANO AD OGNI PLAYER

  for (var j = 0; j < 40; j += 10) {
    if (j == 0) {
      players[j].isPlaying = 1;
    }
    for (var i = 0; i < 10; i++) {
      mano[i] = mazzo[numeri[i + j] - 1];
    }
    mani[j / 10] = ordinaMano(mano);
    players[j / 10].mano = mani[j / 10];
    io.to(players[j / 10].id).emit("playerData", { player: players[j / 10] });
  }
};
