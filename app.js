//inizializzo il server express che verrà usato per le richieste di file tra client e server (le pagine e le foto)
var express = require("express");
var app = express();
var server = require("http").createServer(app);

const {
  playerJoin,
  getCurrentPlayerById,
  getCurrentPlayerByUsername,
  playerLeave,
  getTablePlayer
} = require("./utils/players");

//in questo modo non vengono processate query che richiedono le risorse a /server
//se la query è nulla viene richiamara la funzione
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

//se la query è con client viene mandata la risorsa
app.use("../client", express.static(__dirname + "/client"));
server.listen(8080, () => console.log("server started"));

//inizializzo sockert.io che andrà inserito anche dentro l'index.html
var io = require("socket.io")(server, {});

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var TABLE_LIST = {};

var contatorePlayer = 0;
var contatoreTavoli = 0;

//cancellabile ma non ora perchè viene usato nel game initi
var Player = function(nickname, socketID) {
  var self = {
    id: socketID,
    nickname: nickname,
    tavolo: null,
    team: null,
    mano: []
  };

  return self;
};

var CheckNum = function() {
  do {
    var trovato = false;
    var num = Math.floor(Math.random() * 100);
    for (var i in TABLE_LIST.length) {
      if (TABLE_LIST[i].id == num) {
        trovato == true;
      }
    }
  } while (trovato);

  return num;
};

var Table = function(player, nome) {
  var self = {
    id: CheckNum(),
    player1: player,
    player2: null,
    player3: null,
    player4: null,
    numPart: 1,
    nome: nome,

    addPlayer: function(player) {
      if (self.player2 == null) {
        self.player2 = player;
      } else if (self.player3 == null) {
        self.player3 = player;
      } else if (self.player4 == null) {
        self.player4 = player;
      } else {
        console.log("tavolo pieno");
      }
    }
  };
  return self;
};

var Carta = function(seme, valore) {
  var self = {
    seme: seme,
    valore: valore
  };

  return self;
};

//crea il mazzo ordinato
var makeDeck = function() {
  var semi = ["H", "D", "S", "C"];
  var valori = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var mazzo = [];

  var i,
    j,
    cont = 0;
  for (i = 0; i < semi.length; i++) {
    for (j = 0; j < valori.length; j++) {
      var c = Carta(semi[i], valori[j]);
      mazzo[cont] = c;
      cont++;
    }
  }
  return mazzo;
};

//estrae 40 numeri casuali diversi tra loro --> mischia il mazzo
var estrazioneCasuale = function() {
  var numeri = [];
  var i, j;
  var n;
  var trovato = false;

  for (j = 0; j < 40; j++) {
    n = Math.floor(Math.random() * 40) + 1;
    for (i = 0; i < numeri.length; i++) {
      if (numeri[i] == n) {
        trovato = true;
      }
    }
    if (trovato == false) {
      numeri[j] = n;
    } else {
      j--;
    }
    trovato = false;
  }

  return numeri;
};

/* vecchia versione
io.sockets.on("connection", function(socket) {
  console.log("socket connection");

  //assegno un numero al socket e lo aggiungo alla lista dei socket
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  //ricevo il nome del giocatore e creo il player
  socket.on("nickname", function(data) {
    PLAYER_LIST[socket.id] = Player(data.nickname, socket.id);
    contatorePlayer++;
    console.log(PLAYER_LIST[socket.id]);
  });

  //viene inviato al socket il numero del tavolo da condividere con i player
  var emitTable = function(num) {
    socket.emit("tableNum", {
      num: num
    });
  };

  //richiesta creazione tavolo
  socket.on("creazione", function(data) {
    TABLE_LIST[contatoreTavoli] = Table(PLAYER_LIST[socket.id], data.nome);
    PLAYER_LIST[socket.id].tavolo = TABLE_LIST[contatoreTavoli].id;
    emitTable(TABLE_LIST[contatoreTavoli].id);
    contatoreTavoli++;
    console.log(TABLE_LIST[contatoreTavoli]);
  });

  //mostro i giocatori nel tavolo inviando al client la lista aggiornata di tutti i partecipanti
  var findTableWithNumber = function(number) {
    var trovato = false;
    var i = 0;
    while (!trovato && i < contatoreTavoli) {
      if (TABLE_LIST[i].id == number) {
        trovato = true;
        return i;
      }
      i++;
    }
    return -1;
  };

  //vengono salvati i partecipanti a un tavolo da inviare una volta che il tavolo è completo.
  var partercipanti = function(numTable) {
    var socketPartecipanti = {};
    var number = findTableWithNumber(numTable);
    socketPartecipanti[0] = SOCKET_LIST[TABLE_LIST[number].player1.id];
    socketPartecipanti[1] = SOCKET_LIST[TABLE_LIST[number].player2.id];
    socketPartecipanti[2] = SOCKET_LIST[TABLE_LIST[number].player3.id];
    socketPartecipanti[3] = SOCKET_LIST[TABLE_LIST[number].player4.id];

    var pack = {
      num: numTable,
      player1: PLAYER_LIST[socketPartecipanti[0].id].nickname,
      player2: PLAYER_LIST[socketPartecipanti[1].id].nickname,
      player3: PLAYER_LIST[socketPartecipanti[2].id].nickname,
      player4: PLAYER_LIST[socketPartecipanti[3].id].nickname
    };

    /*
    for(var i in socketPartecipanti){
      socketPartecipanti[i].emit('partecipanti', pack);
    }


    for (var i in socketPartecipanti) {
      socketPartecipanti[i].emit("start", pack);
    }

    initGame(socketPartecipanti);
  };

  //il client invia la richiesta di unirsi a un tavolo, nel data ci sarà il numero del tavolo e la posizione del player
  socket.on("join", function(data) {
    //ricerco se il tavolo esiste e inserisco il giocatore
    var trovato = false;
    var i = 0;
    PLAYER_LIST[socket.id].tavolo = data.num;
    while (!trovato && i < contatoreTavoli) {
      if (TABLE_LIST[i].id == data.num) {
        trovato = true;
        TABLE_LIST[i].addPlayer(PLAYER_LIST[socket.id]);
        TABLE_LIST[i].numPart++;
        if (TABLE_LIST[i].numPart == 4) {
          partercipanti(TABLE_LIST[i].id);
        }
      }
      console.log(
        "ho trovato il tavolo e ha " + TABLE_LIST[i].numPart + " partecipanti"
      );
      i++;
    }
  });

  //elimino il socket quando si disconnette
  socket.on("disconnect", function() {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
    contatorePlayer--;
    //bisogna aggiungere che vengono eliminati i tavoli dove i player se ne vanno ma lo faremo più
    //ora ci affidaimo al buon senso
  });
});
*/

io.on("connection", socket => {
  //join table
  socket.on("joinTable", ({username, table}) => {

    currentPlayers = getTablePlayer(table);
    var controllo = 0;
    //controllo che il tavolo non sia pieno
    if(currentPlayers.length < 4){
      //controllo che lo username nel tavolo non sia gia usato
      for(var i=0; i<currentPlayers.length; i++){
        if(username == currentPlayers[i].username){
          controllo = 1;
          socket.emit('usernameNotValid', {
            error: 'username già usato nel tavolo',
          });
          break;
        }
      }
      if(!controllo){
        const player = playerJoin(socket.id, username, table);

        socket.join(player.table);

        io.to(player.table).emit("tablePlayers", {
          table: player.table,
          players: getTablePlayer(player.table)
        });
      }
    }else{
      socket.emit('fullTable', {
        error: 'il tavolo è pieno',
      });
    }

  });

  socket.on("disconnect", () => {
    const player = playerLeave(socket.id);
    if (player) {
      // send users and room info
      io.to(player.table).emit("tablePlayers", {
        table: player.table,
        players: getTablePlayer(player.table)
      });
    }
  });

  socket.on("changeTeam", ({username}) => {
    player = getCurrentPlayerByUsername(username);
    if(player.team == 0){
      player.team = 1;
    }else{
      player.team = 0;
    }

    io.to(player.table).emit("tablePlayers", {
      table: player.table,
      players: getTablePlayer(player.table)
    });

  })
});

//non funzionante, non testate con acuratezza

var ordinaMano = function(mano) {
  for (i = 0; i < mano.length; i++) {
    for (j = i + 1; j < mano.length; j++) {
      if (mano[i].valore > mano[j].valore) {
        var temp = mano[i];
        mano[i] = mano[j];
        mano[j] = temp;
      }
    }
  }

  return mano;
};

var initGame = function(sockets) {
  var mazzo = makeDeck();
  var numeri = estrazioneCasuale();

  var mani = [];

  var mano1 = [];
  var mano2 = [];
  var mano3 = [];
  var mano4 = [];

  var prese1 = [];
  var prese2 = [];

  var scope1 = [];
  var scope2 = [];

  var campo = [];

  //se 1 è la prma squadra se 2 la seconda...per decidere a chi dare le carte in campo
  var ultimaPresa = 0;

  var contatoreTurno = 1;

  for (var i = 0; i < 10; i++) {
    mano1[i] = mazzo[numeri[i] - 1];
  }
  PLAYER_LIST[socket2[0]].mano = mano1;
  mani[0] = ordinaMano(mano1);

  for (var i = 10; i < 20; i++) {
    mano2[i - 10] = mazzo[numeri[i] - 1];
  }
  PLAYER_LIST[socket2[1]].mano = mano2;
  mani[1] = ordinaMano(mano2);

  for (var i = 20; i < 30; i++) {
    mano3[i - 20] = mazzo[numeri[i] - 1];
  }
  PLAYER_LIST[socket2[2]].mano = mano3;
  mani[2] = ordinaMano(mano3);

  for (var i = 30; i < 40; i++) {
    mano4[i - 30] = mazzo[numeri[i] - 1];
  }
  PLAYER_LIST[socket2[3]].mano = mano4;
  mani[3] = ordinaMano(mano4);

  //invio le mani ai vari player
  for (var i = 0; i < 4; i++) {
    sockets[i].emit("mano", mani[i]);
  }

  /*IMPLEMENTERO' PIU' AVANTI QUESTA FEATURE

  //stabilisco chi deve iniziare
  var cas = Math.floor(Math.random()*4);

  //ordino i socket così che il primo a giocare sia anche il primo della lista senza rovinare l'ordine
  var socket2 = [];
  var i;
  var j = 0;

  for(i=cas;i<4;i++){
    socket2[j] = sockets[i];
    j++;
  }

  for(i = 0;i<cas;i++){
    socket2[j] = sockets[i];
    j++;

  }
  */

  var socket2 = [];
  socket2 = sockets;

  /*
creo il game loop mediante una catena di messaggi e eventi in modo da bloccare
le mani di chi non deve giuocare una volta ricevuta la carta dal giocatore verrà
mandato il messaggio al giocatore successivo, il messaggio per l'ultmo host farà
concludere la mano
*/

  //invio le posizioni iniziali, solo il primo giocatore può mandare la carta
  socket2[0].emit("play");
  socket2[1].emit("stop");
  socket2[2].emit("stop");
  socket2[3].emit("stop");

  //variabili usate da tutti i socket e reimpostate a 0 ogni vola che un nuova carta è giocata

  var presa = 0;
  var somma = 0;
  var asso = 0;
  var carte = [];

  //ricevo la carta dal primo giocatore
  socket2[0].on("card", function(data) {
    //variabili di controllo che evitano che faccia cose inutili
    presa = 0;
    somma = 0;
    asso = 0;
    carte.splice(0, carte.length);

    var dataNic = {
      data: data,
      nickname: PLAYER_LIST[socket2[0].id].nickname
    };

    console.log("Carta giocata: ", data);

    for (var k = 0; k < 4; k++) {
      socket2[k].emit("aggiornaCarta", dataNic);
      console.log("sto aggiornando la carta giocata");
    }
    //mando messaggio di stop
    socket2[0].emit("stop");
    //logiche di gestione del gioco, scope prese punti
    //tolgo la carta dalla mano del giocatore
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

    //controllo se ho giocato un asso
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

          //creo array da mandare per togliere dal campo le due carte uguali
          console.log(
            "sto inviando le carte da togliere dal campo perchè prese"
          );

          carte.push(campo[i]);
          carte.push(data);
          for (var j in socket2) {
            socket2[j].emit("removeCardFromCampo", carte);
          }
          console.log("ho inviato le carte da togliere");
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
                prese1.push(campo[i]);
                prese1.push(campo[j]);
                console.log(
                  "ho trovato una somma e aggiungo le due carte tra quelle da toglire"
                );
                carte.push(campo[i]);
                carte.push(campo[j]);

                prese1.push(data);
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
                prese1.push(campo[i]);
                carte.push(campo[i]);
                prese1.push(data);
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
                prese1.push(campo[i]);
                carte.push(campo[i]);
                prese1.push(data);
                campo.splice(i, 1);
              }
            }
          }
        }

        //ho più possibilità, faccio scegliere dal client
        //mando un messaggio generico
        if (contaSomme > 1) {
          socket2[0].emit("sommeMultiple", campo);

          /*socket2[0].emit('wait');
          socket2[1].emit('wait');
          socket2[2].emit('wait');
          socket2[3].emit('wait');*/

          ultimaPresa = 1;
          console.log("ho troavto più somme possibili");
          //aggiugo la carta gicoata alle prese, tanto una somma verrà scelta
          prese1.push(data);
        } else {
          socket2[0].emit("avanti");
        }
      } else {
        socket2[0].emit("avanti");
      }
    } else {
      socket2[0].emit("avanti");
    }
  });

  socket2[1].on("card", function(data) {
    presa = 0;
    somma = 0;
    asso = 0;
    carte.splice(0, carte.length);

    console.log("Carta giocata: ", data);

    var dataNic = {
      data: data,
      nickname: PLAYER_LIST[socket2[1].id].nickname
    };

    for (var k = 0; k < 4; k++) {
      socket2[k].emit("aggiornaCarta", dataNic);
      console.log("sto aggiornando la carta giocata");
    }

    socket2[1].emit("stop");

    for (var i = 0; i < mani[1].length; i++) {
      if (mani[1][i].valore == data.valore && mani[1][i].seme == data.seme) {
        console.log("dentro if per togliere carta dalla mano");
        mani[1].splice(i, 1);
        console.log(
          "la carta giocata era la numero: ",
          data,
          "la nuova mano è: ",
          mani[1]
        );
      }
    }

    if (data.valore == 1) {
      //se trovo l'asso aggiugo il campo alla presa e lo svuto
      console.log("e' stato giocato un asso");
      prese2.push(data);
      for (var i = 0; i < campo.length; i++) {
        prese2.push(campo[i]);
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
          prese2.push(campo[i]);
          prese2.push(data);
          ultimaPresa = 2;

          presa = 1;

          //creo array da mandare per togliere dal campo le due carte uguali
          console.log(
            "sto inviando le carte da togliere dal campo perchè prese"
          );

          carte.push(campo[i]);
          carte.push(data);
          for (var j in socket2) {
            socket2[j].emit("removeCardFromCampo", carte);
          }
          console.log("ho inviato le carte da togliere");
          //svuoto l'array carte cos' da poterlo riuatilizzare
          carte.splice(0, carte.length);

          if (campo.length == 1) {
            scope2.push(data);
            console.log("ho anche fatto scopa");
          }
          console.log("questo è il campo prima dello splice: \n", campo);
          campo.splice(i, 1);
          console.log("ho eliminato la carta del campo: \n", campo);
        }
      }
      //controllo le somme
      //prima guardo quante somme ci sono, se sono più di una è necessario far scegliere al giocatore
      if (presa == 0) {
        var sommeTriple = false;
        var contaSomme = 0;
        var tipoSommaTripla = 0;

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

        for (var i = 0; i < campo.length; i++) {
          for (var j = i + 1; j < campo.length; j++) {
            if (campo[i].valore + campo[j].valore == data.valore) {
              contaSomme++;
              console.log("ho trovato una somma");
            }
          }
        }

        if (contaSomme == 0 && !sommeTriple) {
          campo.push(data);
        }

        if (contaSomme == 1 && !sommeTriple) {
          ultimaPresa = 2;
          for (var i = 0; i < campo.length; i++) {
            for (var j = i + 1; j < campo.length; j++) {
              if (campo[i].valore + campo[j].valore == data.valore) {
                //ho trovato una somma
                prese2.push(campo[i]);
                prese2.push(campo[j]);

                console.log(
                  "ho trovato una somma e aggiungo le due carte tra quelle da toglire"
                );
                carte.push(campo[i]);
                carte.push(campo[j]);

                prese2.push(data);
                campo.splice(j, 1);
                campo.splice(i, 1);
              }
            }
          }
        }

        if (contaSomme == 0 && sommeTriple) {
          ultimaPresa = 2;
          if (tipoSommaTripla == 1) {
            for (var i = 0; i < campo.length; i++) {
              if (
                campo[i].valore == 2 ||
                campo[i].valore == 3 ||
                campo[i].valore == 4
              ) {
                prese2.push(campo[i]);
                carte.push(campo[i]);
                prese2.push(data);
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
                prese2.push(campo[i]);
                carte.push(campo[i]);
                prese2.push(data);
                campo.splice(i, 1);
              }
            }
          }
        }
        //la uso nel caso di più somme per capire se rimanere in attesa della rispposta del client o se andare avanti

        if (contaSomme > 1) {
          socket2[1].emit("sommeMultiple", campo);

          /*socket2[0].emit('wait');
          socket2[1].emit('wait');
          socket2[2].emit('wait');
          socket2[3].emit('wait');*/

          ultimaPresa = 2;
          console.log("ho troavto più somme possibili");
          //aggiugo la carta gicoata alle prese, tanto una somma verrà scelta
          prese2.push(data);
        } else {
          socket2[1].emit("avanti");
          console.log("sto mandando il segnale di avanti");
        }
      } else {
        socket2[1].emit("avanti");
      }
    } else {
      socket2[1].emit("avanti");
    }
  });

  socket2[2].on("card", function(data) {
    //variabili di controllo che evitano che faccia cose inutili
    presa = 0;
    somma = 0;
    asso = 0;
    carte.splice(0, carte.length);

    console.log("Carta giocata: ", data);

    var dataNic = {
      data: data,
      nickname: PLAYER_LIST[socket2[2].id].nickname
    };

    for (var k = 0; k < 4; k++) {
      socket2[k].emit("aggiornaCarta", dataNic);
      console.log("sto aggiornando la carta giocata");
    }
    //mando messaggio di stop
    socket2[2].emit("stop");
    //logiche di gestione del gioco, scope prese punti
    //tolgo la carta dalla mano del giocatore
    console.log("Rimuovo la caera giocata dalla mano del giocatore");
    for (var i = 0; i < mani[0].length; i++) {
      if (mani[2][i].valore == data.valore && mani[2][i].seme == data.seme) {
        console.log("dentro il primo if");
        mani[2].splice(i, 1); //elimino la carta giocata
        console.log(
          "la carta giocata era la numero: ",
          data,
          "la nuova mano è: ",
          mani[2]
        );
      }
    }

    //controllo se ho giocato un asso
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

          //creo array da mandare per togliere dal campo le due carte uguali
          console.log(
            "sto inviando le carte da togliere dal campo perchè prese"
          );

          carte.push(campo[i]);
          carte.push(data);
          for (var j in socket2) {
            socket2[j].emit("removeCardFromCampo", carte);
          }
          console.log("ho inviato le carte da togliere");
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
                prese1.push(campo[i]);
                prese1.push(campo[j]);
                console.log(
                  "ho trovato una somma e aggiungo le due carte tra quelle da toglire"
                );
                carte.push(campo[i]);
                carte.push(campo[j]);

                prese1.push(data);
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
                prese1.push(campo[i]);
                carte.push(campo[i]);
                prese1.push(data);
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
                prese1.push(campo[i]);
                carte.push(campo[i]);
                prese1.push(data);
                campo.splice(i, 1);
              }
            }
          }
        }

        //ho più possibilità, faccio scegliere dal client
        //mando un messaggio generico
        if (contaSomme > 1) {
          socket2[2].emit("sommeMultiple", campo);

          /*socket2[0].emit('wait');
          socket2[1].emit('wait');
          socket2[2].emit('wait');
          socket2[3].emit('wait');*/

          ultimaPresa = 1;
          console.log("ho troavto più somme possibili");
          //aggiugo la carta gicoata alle prese, tanto una somma verrà scelta
          prese1.push(data);
        } else {
          socket2[2].emit("avanti");
        }
      } else {
        socket2[2].emit("avanti");
      }
    } else {
      socket2[2].emit("avanti");
    }
  });

  socket2[3].on("card", function(data) {
    presa = 0;
    somma = 0;
    asso = 0;
    carte.splice(0, carte.length);

    console.log("Carta giocata: ", data);

    var dataNic = {
      data: data,
      nickname: PLAYER_LIST[socket2[3].id].nickname
    };

    for (var k = 0; k < 4; k++) {
      socket2[k].emit("aggiornaCarta", dataNic);
      console.log("sto aggiornando la carta giocata");
    }

    socket2[3].emit("stop");

    for (var i = 0; i < mani[3].length; i++) {
      if (mani[3][i].valore == data.valore && mani[3][i].seme == data.seme) {
        console.log("dentro if per togliere carta dalla mano");
        mani[3].splice(i, 1);
        console.log(
          "la carta giocata era la numero: ",
          data,
          "la nuova mano è: ",
          mani[3]
        );
      }
    }

    if (data.valore == 1) {
      //se trovo l'asso aggiugo il campo alla presa e lo svuto
      console.log("e' stato giocato un asso");
      prese2.push(data);
      for (var i = 0; i < campo.length; i++) {
        prese2.push(campo[i]);
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
          prese2.push(campo[i]);
          prese2.push(data);
          ultimaPresa = 2;

          presa = 1;

          //creo array da mandare per togliere dal campo le due carte uguali
          console.log(
            "sto inviando le carte da togliere dal campo perchè prese"
          );

          carte.push(campo[i]);
          carte.push(data);
          for (var j in socket2) {
            socket2[j].emit("removeCardFromCampo", carte);
          }
          console.log("ho inviato le carte da togliere");
          //svuoto l'array carte cos' da poterlo riuatilizzare
          carte.splice(0, carte.length);

          if (campo.length == 1) {
            scope2.push(data);
            console.log("ho anche fatto scopa");
          }
          console.log("questo è il campo prima dello splice: \n", campo);
          campo.splice(i, 1);
          console.log("ho eliminato la carta del campo: \n", campo);
        }
      }
      //controllo le somme
      //prima guardo quante somme ci sono, se sono più di una è necessario far scegliere al giocatore
      if (presa == 0) {
        var sommeTriple = false;
        var contaSomme = 0;
        var tipoSommaTripla = 0;

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

        for (var i = 0; i < campo.length; i++) {
          for (var j = i + 1; j < campo.length; j++) {
            if (campo[i].valore + campo[j].valore == data.valore) {
              contaSomme++;
              console.log("ho trovato una somma");
            }
          }
        }

        if (contaSomme == 0 && !sommeTriple) {
          campo.push(data);
        }

        if (contaSomme == 1 && !sommeTriple) {
          ultimaPresa = 2;
          for (var i = 0; i < campo.length; i++) {
            for (var j = i + 1; j < campo.length; j++) {
              if (campo[i].valore + campo[j].valore == data.valore) {
                //ho trovato una somma
                prese2.push(campo[i]);
                prese2.push(campo[j]);

                console.log(
                  "ho trovato una somma e aggiungo le due carte tra quelle da toglire"
                );
                carte.push(campo[i]);
                carte.push(campo[j]);

                prese2.push(data);
                campo.splice(j, 1);
                campo.splice(i, 1);
              }
            }
          }
        }

        if (contaSomme == 0 && sommeTriple) {
          ultimaPresa = 2;
          if (tipoSommaTripla == 1) {
            for (var i = 0; i < campo.length; i++) {
              if (
                campo[i].valore == 2 ||
                campo[i].valore == 3 ||
                campo[i].valore == 4
              ) {
                prese2.push(campo[i]);
                carte.push(campo[i]);
                prese2.push(data);
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
                prese2.push(campo[i]);
                carte.push(campo[i]);
                prese2.push(data);
                campo.splice(i, 1);
              }
            }
          }
        }
        //la uso nel caso di più somme per capire se rimanere in attesa della rispposta del client o se andare avanti

        if (contaSomme > 1) {
          socket2[3].emit("sommeMultiple", campo);

          /*socket2[0].emit('wait');
          socket2[1].emit('wait');
          socket2[2].emit('wait');
          socket2[3].emit('wait');*/

          ultimaPresa = 2;
          console.log("ho troavto più somme possibili");
          //aggiugo la carta gicoata alle prese, tanto una somma verrà scelta
          prese2.push(data);
        } else {
          socket2[3].emit("avanti");
        }
      } else {
        socket2[3].emit("avanti");
      }
    } else {
      socket2[3].emit("avanti");
    }
  });

  /*
  struttura dati nella unzione procedi

    caso: 0/1/2/3 a seconda di quante carte prese con la somma
    data: carte[] array con le carte prese

  */

  socket2[0].on("procedi", function(data) {
    if (data.caso == 0) {
    } else if (data.caso == 1) {
    } else {
      for (var j in data.data) {
        for (var i = 0; i < campo.length; i++) {
          if (
            campo[i].valore == data.data[j].valore &&
            campo[i].seme == data.data[j].seme
          ) {
            prese1.push(campo[i]);
            carte.push(campo[i]);
            campo.splice(i, 1);
          }
        }
      }
    }

    console.log("invio le carte da togliere perchè sono state prese");
    for (var i in socket2) {
      socket2[i].emit("removeCardFromCampo", carte);
    }

    //pulisco array carte
    carte.splice(0, carte.length);

    console.log("sto per mandare di disefnare il campo");
    console.log("questo è il campo: \n", campo);
    for (i in socket2) {
      socket2[i].emit("drawCampo", campo);
    }
    console.log("dovrei aver diseganto il campo");
    //invio il messaggio che il secondo giocatore puo mandare la sua Carta
    socket2[1].emit("play");
  });

  socket2[1].on("procedi", function(data) {
    if (data.caso == 0) {
    } else if (data.caso == 1) {
    } else {
      for (var j in data.data) {
        for (var i = 0; i < campo.length; i++) {
          if (
            campo[i].valore == data.data[j].valore &&
            campo[i].seme == data.data[j].seme
          ) {
            prese2.push(campo[i]);
            carte.push(campo[i]);
            campo.splice(i, 1);
          }
        }
      }
    }

    console.log("invio le carte da togliere perchè sono state prese");
    for (var i in socket2) {
      socket2[i].emit("removeCardFromCampo", carte);
    }

    //pulisco array carte
    carte.splice(0, carte.length);

    console.log("sto per mandare di disefnare il campo");
    console.log("questo è il campo: \n", campo);
    for (i in socket2) {
      socket2[i].emit("drawCampo", campo);
    }
    console.log("dovrei aver diseganto il campo");
    //invio il messaggio che il secondo giocatore puo mandare la sua Carta
    socket2[2].emit("play");
  });

  socket2[2].on("procedi", function(data) {
    if (data.caso == 0) {
    } else if (data.caso == 1) {
    } else {
      for (var j in data.data) {
        for (var i = 0; i < campo.length; i++) {
          if (
            campo[i].valore == data.data[j].valore &&
            campo[i].seme == data.data[j].seme
          ) {
            prese1.push(campo[i]);
            carte.push(campo[i]);
            campo.splice(i, 1);
          }
        }
      }
    }

    console.log("invio le carte da togliere perchè sono state prese");
    for (var i in socket2) {
      socket2[i].emit("removeCardFromCampo", carte);
    }

    //pulisco array carte
    carte.splice(0, carte.length);

    console.log("sto per mandare di disefnare il campo");
    console.log("questo è il campo: \n", campo);
    for (i in socket2) {
      socket2[i].emit("drawCampo", campo);
    }
    console.log("dovrei aver diseganto il campo");
    //invio il messaggio che il secondo giocatore puo mandare la sua Carta
    socket2[3].emit("play");
  });

  socket2[3].on("procedi", function(data) {
    if (data.caso == 0) {
    } else if (data.caso == 1) {
    } else {
      for (var j in data.data) {
        for (var i = 0; i < campo.length; i++) {
          if (
            campo[i].valore == data.data[j].valore &&
            campo[i].seme == data.data[j].seme
          ) {
            prese2.push(campo[i]);
            carte.push(campo[i]);
            campo.splice(i, 1);
          }
        }
      }
    }

    console.log("invio le carte da togliere perchè sono state prese");
    for (var i in socket2) {
      socket2[i].emit("removeCardFromCampo", carte);
    }

    //pulisco array carte
    carte.splice(0, carte.length);

    console.log("sto per mandare di disefnare il campo");
    console.log("questo è il campo: \n", campo);
    for (i in socket2) {
      socket2[i].emit("drawCampo", campo);
    }
    console.log("dovrei aver diseganto il campo");
    //invio il messaggio che il secondo giocatore puo mandare la sua Carta
    if (contatoreTurno != 10) {
      contatoreTurno++;
      socket2[0].emit("play");
    } else {
      //se il contatore dei turni è uguale a 10 vuol dir e che era l'ultima mano, chiamo la fine del gico
      endGame(prese1, prese2, socket2);
    }
  });

  socket2[0].on("reSommeMultiple", function() {
    socket2[0].emit("sommeMultiple", campo);
  });

  socket2[1].on("reSommeMultiple", function() {
    socket2[1].emit("sommeMultiple", campo);
  });

  socket2[2].on("reSommeMultiple", function() {
    socket2[2].emit("sommeMultiple", campo);
  });

  socket2[3].on("reSommeMultiple", function() {
    socket2[3].emit("sommeMultiple", campo);
  });

  var endGame = function() {
    console.log("endgame raggiunto");

    if (ultimaPresa == 1) {
      for (i in campo) {
        prese1.push(campo[i]);
      }
    } else {
      for (i in campo) {
        prese2.push(campo[i]);
      }
    }

    var data1 = {
      prese: prese1,
      scope: scope1
    };

    var data2 = {
      prese: prese2,
      scope: scope2
    };

    socket2[0].emit("prese", data1);
    socket2[2].emit("prese", data1);
    socket2[1].emit("prese", data2);
    socket2[3].emit("prese", data2);

    //CONTEGGIO DEI PUNTI

    var punti1 = 0;
    var punti2 = 0;

    //carte
    if (prese1.length > prese2.length) {
      punti1++;
      console.log("carte di squadra 1 con: ", prese1.length);
    } else {
      if (prese1.length < prese2.length) {
        punti2++;
        console.log("carte di squadra 2 con: ", prese2.length);
      }
    }
    //fine carte

    //setteBello
    for (var i in prese1) {
      if (prese1[i].valore == 7 && prese1[i].seme == "D") {
        punti1++;
        console.log("settebello della squadra 1 in posizione: ", i);
        console.log("controllo: ", prese1[i]);
      }
    }

    for (var i in prese2) {
      if (prese2[i].valore == 7 && prese2[i].seme == "D") {
        punti2++;
        console.log("settebello della squadra 2 in posizione: ", i);
        console.log("controllo: ", prese2[i]);
      }
    }
    //fine settebello

    //primiera
    var sette = [0, 0, 0, 0];
    var sei = [0, 0, 0, 0];
    var asso = [0, 0, 0, 0];
    var cinque = [0, 0, 0, 0];

    var sette2 = [0, 0, 0, 0];
    var sei2 = [0, 0, 0, 0];
    var asso2 = [0, 0, 0, 0];
    var cinque2 = [0, 0, 0, 0];

    var totale = [0, 0, 0, 0];
    var totale2 = [0, 0, 0, 0];

    var semi = ["H", "D", "C", "S"];
    var semiEsclusione = semi;

    for (i in prese1) {
      if (prese1[i].valore == 7) {
        if (prese1[i].seme == "H") {
          sette[0] = 21;
        }
        if (prese1[i].seme == "D") {
          sette[1] = 21;
        }
        if (prese1[i].seme == "S") {
          sette[2] = 21;
        }
        if (prese1[i].seme == "C") {
          sette[3] = 21;
        }
      }
      if (prese1[i].valore == 6) {
        if (prese1[i].seme == "H") {
          sei[0] = 18;
        }
        if (prese1[i].seme == "D") {
          sei[1] = 18;
        }
        if (prese1[i].seme == "S") {
          sei[2] = 18;
        }
        if (prese1[i].seme == "C") {
          sei[3] = 18;
        }
      }
      if (prese1[i].valore == 1) {
        if (prese1[i].seme == "H") {
          asso[0] = 16;
        }
        if (prese1[i].seme == "D") {
          asso[1] = 16;
        }
        if (prese1[i].seme == "S") {
          asso[2] = 16;
        }
        if (prese1[i].seme == "C") {
          asso[3] = 16;
        }
      }
      if (prese1[i].valore == 5) {
        if (prese1[i].seme == "H") {
          cinque[0] = 15;
        }
        if (prese1[i].seme == "D") {
          cinque[1] = 15;
        }
        if (prese1[i].seme == "S") {
          cinque[2] = 15;
        }
        if (prese1[i].seme == "C") {
          cinque[3] = 15;
        }
      }
    }

    for (i in prese2) {
      if (prese2[i].valore == 7) {
        if (prese2[i].seme == "H") {
          sette2[0] = 21;
        }
        if (prese2[i].seme == "D") {
          sette2[1] = 21;
        }
        if (prese2[i].seme == "S") {
          sette2[2] = 21;
        }
        if (prese2[i].seme == "C") {
          sette2[3] = 21;
        }
      }
      if (prese2[i].valore == 6) {
        if (prese2[i].seme == "H") {
          sei2[0] = 18;
        }
        if (prese2[i].seme == "D") {
          sei2[1] = 18;
        }
        if (prese2[i].seme == "S") {
          sei2[2] = 18;
        }
        if (prese2[i].seme == "C") {
          sei2[3] = 18;
        }
      }
      if (prese2[i].valore == 1) {
        if (prese2[i].seme == "H") {
          asso2[0] = 16;
        }
        if (prese2[i].seme == "D") {
          asso2[1] = 16;
        }
        if (prese2[i].seme == "S") {
          asso2[2] = 16;
        }
        if (prese2[i].seme == "C") {
          asso2[3] = 16;
        }
      }
      if (prese2[i].valore == 5) {
        if (prese2[i].seme == "H") {
          cinque2[0] = 15;
        }
        if (prese2[i].seme == "D") {
          cinque2[1] = 15;
        }
        if (prese2[i].seme == "S") {
          cinque2[2] = 15;
        }
        if (prese2[i].seme == "C") {
          cinque2[3] = 15;
        }
      }
    }

    var controlloZeri = 0;
    var controlloZeri2 = 0;

    for (i in totale) {
      totale[i] = sette[i] + sei[i] + asso[i] + cinque[i];
      if (totale[i] == 0) {
        controlloZeri++;
      }
      totale2[i] = sette2[i] + sei2[i] + asso2[i] + cinque2[i];
      if (totale2[i] == 0) {
        controlloZeri2++;
      }
    }

    if (controlloZeri == 0 && controlloZeri2 == 0) {
      if (
        totale[0] + totale[1] + totale[2] + totale[3] >
        totale2[0] + totale2[1] + totale2[2] + totale2[3]
      ) {
        punti1++;
        console.log("la squadra 1 ha fatto la primiera");
      } else {
        if (
          totale[0] + totale[1] + totale[2] + totale[3] <
          totale2[0] + totale2[1] + totale2[2] + totale2[3]
        ) {
          punti2++;
          console.log("la squadra 2 ha fatto la primiera");
        } else {
          console.log("la primiera è pari");
        }
      }
    } else {
      if (controlloZeri == 0 && controlloZeri2 != 0) {
        punti1++;
        console.log("la squadra 1 ha fatto la primiera");
      } else {
        if (controlloZeri != 0 && controlloZeri2 == 0) {
          punti2++;
          console.log("la squadra 2 ha fatto la primiera");
        } else {
          if (
            totale[0] + totale[1] + totale[2] + totale[3] >
            totale2[0] + totale2[1] + totale2[2] + totale2[3]
          ) {
            punti1++;
            console.lof("la squadra 1 ha fatto la primiera");
          } else {
            if (
              totale[0] + totale[1] + totale[2] + totale[3] <
              totale2[0] + totale2[1] + totale2[2] + totale2[3]
            ) {
              punti2++;
              console.log("la squadra 2 ha fatto la primiera");
            } else {
              console.log("la primiera è pari");
            }
          }
        }
      }
    }
    //fine primiera

    //aggiungo le scope
    punti1 += scope1.length;
    punti2 += scope2.length;
    // fine aggiunta scope

    //ori
    var cont = 0;
    for (i in prese1) {
      if (prese1[i].seme == "D") {
        cont++;
      }
    }
    if (cont > 5) {
      console.log("la prima squadra ha fatto ori");
      punti1++;
    } else {
      if (cont < 5) {
        console.log("la seconda squadra ha fatto ori");
        punti2++;
      }
    }
    //fine ori

    //napola
    console.log("sto calcolando la napola della prima squadra");
    var napola = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i in prese1) {
      console.log("carta: ", prese1[i].valore, " seme: ", prese1[i].seme);
      if (prese1[i].seme == "D") {
        napola[prese1[i].valore - 1] = 1;
      }
    }
    console.log("questa è la napola fatta dalla prima squadra: ", napola);
    cont = 0;
    i = 0;
    var trovato = false;
    while (!trovato) {
      if (napola[i] == 1) {
        cont++;
      } else {
        trovato = 1;
      }
      i++;
    }
    if (cont >= 3) {
      punti1 += cont;
    }
    if (cont == 10) {
      //finePartita() --> da fare ancora quando napoleone vado alla vera fine della partita
    }

    napola = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i in prese2) {
      if (prese2[i].seme == "D") {
        napola[prese2[i].valore - 1] = 1;
      }
    }
    console.log("questa è la napola fatta dalla seconda squadra: ", napola);
    cont = 0;
    i = 0;
    trovato = false;
    while (!trovato) {
      if (napola[i] == 1) {
        cont++;
      } else {
        trovato = 1;
      }
      i++;
    }
    if (cont >= 3) {
      punti2 += cont;
    }
    if (cont == 10) {
      //finePartita() --> da fare ancora quando napoleone vado alla vera fine della partita
    }

    //finenapola
    var puntiSquadra1 = {
      p: punti1,
      pA: punti2
    };

    var puntiSquadra2 = {
      pA: punti1,
      p: punti2
    };

    socket2[0].emit("punti", puntiSquadra1);
    socket2[2].emit("punti", puntiSquadra1);
    socket2[1].emit("punti", puntiSquadra2);
    socket2[3].emit("punti", puntiSquadra2);
  };
};

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
