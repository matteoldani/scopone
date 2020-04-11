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
var players = [];

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
    players = getTablePlayer(table);
    if (players.length == 4) {
      players = initGame(players, io);
      io.to(players[0].table).emit("gameIsStarting");
      giocaMano(players, 0, 0);
    }
  });

  socket.on("card", ({ id, data }) => {
    onCard(socket, id, data);
  });
});

var giocaMano = function (players, puntiPrimoTeam, puntiSecondoTeam) {
  //ASSEGNO LA MANO AD OGNI PLAYER

  for (var j = 0; j < 40; j += 10) {
    if (j == 0) {
      players[j].isPlaying = 1;
    }
    for (var i = 0; i < 10; i++) {
      mano[i] = mazzo[numeri[i + j] - 1];
    }
    mani[j / 10] = ordinaMano(mano);
    //players[j / 10].mano = mani[j / 10];
    io.to(players[j / 10].id).emit("playerCards", { cards: mani[j / 10] });
  }
  io.to(players[0].table).emit("tablePlayers", {
    table: players[0].table,
    players: getTablePlayer(players[0].table),
  });
  //salvo la lista dei socket dei giocatori
  for (var i = 0; i < 4; i++) {
    socketsList[i] = io.sockets.connected[players[i].id];
  }

  //variabili usate da tutti i socket e reimpostate a 0 ogni vola che un nuova carta è giocata
};

var onCard = function (scoekt, id, data) {
  var index;
  var presa = 0;
  var somma = 0;
  var asso = 0;
  var carte = [];
  carte.splice(0, carte.length);

  console.log("Carta giocata: ", data);

  for (var j = 0; j < 4; j++) {
    if (players[j].id == id) {
      index = j;
      break;
    }
  }

  console.log("Rimuovo la caera giocata dalla mano del giocatore");
  for (var i = 0; i < mani[index].length; i++) {
    if (
      mani[index][i].valore == data.valore &&
      mani[index][i].seme == data.seme
    ) {
      console.log("dentro il primo if");
      mani[index].splice(i, 1); //elimino la carta giocata
      console.log(
        "la carta giocata era la numero: ",
        data,
        "la nuova mano è: ",
        mani[index]
      );
    }
  }
  io.to(players[index].id).emit("playerCards", { cards: mani[index] });

  if (data.valore == 1) {
    //se trovo l'asso aggiugo il campo alla presa e lo svuto
    console.log("e' stato giocato un asso");
    prese1.push(data);
    for (var i = 0; i < campo.length; i++) {
      if (index == 0 || index == 2) {
        prese1.push(campo[i]);
      } else {
        prese2.push(campo[i]);
      }

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
        if (index == 0 || index == 2) {
          prese1.push(campo[i]);
          prese1.push(data);
        } else {
          prese2.push(campo[i]);
          prese2.push(data);
        }
        campo.splice(i, 1);
        ultimaPresa = 1;
        presa = 1;

        carte.push(campo[i]);
        carte.push(data);

        //svuoto l'array carte cos' da poterlo riuatilizzare
        carte.splice(0, carte.length);
        if (campo.length == 1) {
          if (index == 0 || index == 2) {
            scope1.push(data);
          } else {
            scope2.push(data);
          }

          console.log("ho anche fatto scopa");
        }
        /*
          console.log("questo è il campo prima dello splice: \n", campo);
          campo.splice(i, 1);
          console.log("ho eliminato la carta del campo: \n", campo);
          */
        break;
      }
    }

    //controllo le somme
    //prima guardo quante somme ci sono, se sono più di una è necessario far scegliere al giocatore
    if (presa == 0) {
      var sommeTriple = false;
      var contaSomme = 0;
      var tipoSommaTripla = 0; // 1/2 se è con la donna o con il re

      //verifico che non si ci sia una somma tripla possibile
      //some tripple 2+3+4 = 9 o 2+3+5 = 10
      if (data.valore == 9 || data.valore == 10) {
        //varibili di controllo
        var d = 0;
        var t = 0;
        var q = 0;
        var c = 0;
        for (var i = 0; i < campo.length; i++) {
          if (campo[i].valore == 2) {
            d = 1;
          }
          if (campo[i].valore == 3) {
            t = 1;
          }
          if (campo[i].valore == 4) {
            q = 1;
          }
          if (campo[i].valore == 5) {
            c = 1;
          }
        }
        if (d == 1 && t == 1) {
          if (q == 1 && data.valore == 9) {
            sommeTriple = true;
            tipoSommaTripla = 1;
          }

          if (c == 1 && data.valore == 10) {
            sommeTriple = true;
            tipoSommaTripla = 2;
          }
        }
      }

      //conto le somme doppie possibili
      for (var i = 0; i < campo.length; i++) {
        for (var j = i + 1; j < campo.length; j++) {
          if (campo[i].valore + campo[j].valore == data.valore) {
            //ho trovato una somma
            console.log("ho trovato una somma");
            contaSomme++;
          }
        }
      }

      //non ci sono prese
      if (contaSomme == 0 && !sommeTriple) {
        campo.push(data);
      }

      //c'è solo una somma possibile ed è somma classica
      if (contaSomme == 1 && !sommeTriple) {
        ultimaPresa = 1;
        for (var i = 0; i < campo.length; i++) {
          for (var j = i + 1; j < campo.length; j++) {
            if (campo[i].valore + campo[j].valore == data.valore) {
              //ho trovato una somma
              if (index == 0 || index == 2) {
                prese1.push(campo[i]);
                prese1.push(campo[j]);
                prese1.push(data);
              } else {
                prese2.push(campo[i]);
                prese2.push(campo[j]);
                prese2.push(data);
              }

              console.log(
                "ho trovato una somma e aggiungo le due carte tra quelle da toglire"
              );
              carte.push(campo[i]);
              carte.push(campo[j]);

              campo.splice(j, 1);
              campo.splice(i, 1);
            }
          }
        }
      }

      //c'è solo una somma tripla
      if (contaSomme == 0 && sommeTriple) {
        ultimaPresa = 1;
        if (tipoSommaTripla == 1) {
          for (var i = 0; i < campo.length; i++) {
            if (
              campo[i].valore == 2 ||
              campo[i].valore == 3 ||
              campo[i].valore == 4
            ) {
              if (index == 0 || index == 2) {
                prese1.push(campo[i]);
                prese1.push(data);
              } else {
                prese2.push(campo[i]);
                prese2.push(data);
              }

              carte.push(campo[i]);
              campo.splice(i, 1);
            }
          }
        } else {
          for (var i = 0; i < campo.length; i++) {
            if (
              campo[i].valore == 2 ||
              campo[i].valore == 3 ||
              campo[i].valore == 5
            ) {
              if (index == 0 || index == 2) {
                prese1.push(campo[i]);
                prese1.push(data);
              } else {
                prese2.push(campo[i]);
                prese2.push(data);
              }

              carte.push(campo[i]);
              campo.splice(i, 1);
            }
          }
        }
      }
      //ho più possibilità, faccio scegliere dal client
      //mando un messaggio generico
      if (contaSomme > 1) {
        socketsList[index].emit("sommeMultiple", campo);
        ultimaPresa = 1;
        console.log("ho troavto più somme possibili");
        //aggiugo la carta gicoata alle prese, tanto una somma verrà scelta
        if (index == 0 || index == 2) {
          prese1.push(data);
        } else {
          prese2.push(data);
        }
      } else {
        if (contatoreTurno != 10) {
          if (index == 3) {
            contatoreTurno++;
          }
          players[(index + 1) % 4].isPlaying = 1;
          io.to(players[0].table).emit("tableCards", {
            campo: campo,
            lastPlayedCard: data,
          });
        } else {
          endGame(prese1, prese2, socketsList);
        }
      }
    } else {
      if (contatoreTurno != 10) {
        if (index == 3) {
          contatoreTurno++;
        }
        players[(index + 1) % 4].isPlaying = 1;
        io.to(players[0].table).emit("tableCards", {
          campo: campo,
          lastPlayedCard: data,
        });
      } else {
        endGame(prese1, prese2, socketsList);
      }
    }
  } else {
    if (contatoreTurno != 10) {
      if (index == 3) {
        contatoreTurno++;
      }

      io.to(players[0].table).emit("tableCards", {
        campo: campo,
        lastPlayedCard: data,
      });
    } else {
      endGame(prese1, prese2, socketsList);
    }
  }

  players[index].isPlaying = 0;
  io.to(players[index].table).emit("tablePlayers", {
    table: players[index].table,
    players: getTablePlayer(players[index].table),
  });
};

/*
message tablePlayer sends the object 'player' to evreyone
message tableCards semds the object 'campo' and the last played card to evreone
message playerCards sends the hand of a specific player only to his clinet
*/
