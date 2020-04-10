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
  var socketsList = [];
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
  //salvo la lista dei socket dei giocatori
  for (var i = 0; i < 4; i++) {
    socketsList[i] = io.sockets.connected[players[i].id];
  }

  //variabili usate da tutti i socket e reimpostate a 0 ogni vola che un nuova carta è giocata

  var presa = 0;
  var somma = 0;
  var asso = 0;
  var carte = [];

  socketsList[0].on("card", (data) => {
    presa = 0;
    somma = 0;
    asso = 0;
    carte.splice(0, carte.length);

    console.log("Carta giocata: ", data);

    //metto in pausa il giocatore
    players[0].isPlaying = 0;
    io.to(players[0].table).emit("tablePlayers", {
      table: players[0].table,
      players: getTablePlayer(players[0].table),
    });

    console.log("Rimuovo la caera giocata dalla mano del giocatore");
    for (var i = 0; i < mani[0].length; i++) {
      if (mani[0][i].valore == data.valore && mani[0][i].seme == data.seme) {
        console.log("dentro il primo if");
        mani[0].splice(i, 1); //elimino la carta giocata
        console.log(
          "la carta giocata era la numero: ",
          data,
          "la nuova mano è: ",
          mani[0]
        );
      }
    }

    if (data.valore == 1) {
      //se trovo l'asso aggiugo il campo alla presa e lo svuto
      console.log("e' stato giocato un asso");
      prese1.push(data);
      for (var i = 0; i < campo.length; i++) {
        prese1.push(campo[i]);
        console.log("aggiungo carte anche tra quelle da toglire dal campo");
        carte.push(campo[i]);
        ultimaPresa = 1;
      }
      //svuoto il campo
      campo.splice(0, campo.length);
      asso = 1;
    }

    if (asso == 0) {
      console.log("controllo se la carta è in campo e posso prendere");
      for (var i = 0; i < campo.length; i++) {
        if (campo[i].valore == data.valore) {
          console.log("ho trovato una carta uguale, la prendo");
          prese1.push(campo[i]);
          prese1.push(data);
          ultimaPresa = 1;
          presa = 1;

          carte.push(campo[i]);
          carte.push(data);

          //svuoto l'array carte cos' da poterlo riuatilizzare
          carte.splice(0, carte.length);
          if (campo.length == 1) {
            scope1.push(data);
            console.log("ho anche fatto scopa");
          }
          console.log("questo è il campo prima dello splice: \n", campo);
          campo.splice(i, 1);
          console.log("ho eliminato la carta del campo: \n", campo);
        }
      }
    }
    campo.push(data);
    console.log(campo);

    //mando il campo e l'ultima carta giocata a tutti i players
    io.to(players[0].table).emit("tableCards", {
      campo: campo,
      lastPlayedCard: data,
    });
  });

  socketsList[1].on("card", ({ data }) => {});

  socketsList[2].on("card", ({ data }) => {});

  socketsList[3].on("card", ({ data }) => {});
};
