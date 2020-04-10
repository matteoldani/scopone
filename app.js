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

const { giocaMano, initGame } = require("./utils/gameLoop");

//in questo modo non vengono processate query che richiedono le risorse a /server
//se la query è nulla viene richiamara la funzione
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

//se la query è con client viene mandata la risorsa
app.use("../client", express.static(__dirname + "/client"));
server.listen(8080, () => console.log("server started"));

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
        console.log(player);
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
    players = getTablePlayer(table);
    for (var i = 0; i < 4; i++) {
      players[i].socket = io.sockets.connected(players[i].id);
    }
    if (players.length == 4) {
      initGame(players);
    }
  });
});

/*
cose da lascoate in sospeso:



pensare se è il caso di fare delle animazioni
da aggiungere poi quale è l'ultima presa fatta

 sistamare il messaggio su chi sta giocando (visualizzare il nome al posto di "non è il tuo turno apsetta")



*/

////////CODICE DI ESEMPIO///////////
/*
//ricevo il messaggio inviato dalla pagina html
socket.on('happy', function(data){ //il parametro della funzione sono i dati che passo da html, prima che non passavo nulla c'era socket
  console.log('happy has been recived' + data.reason);
});

//posso inviare un messaggio
socket.emit('serverMsg', {
  msg: 'hello',
});
*/
