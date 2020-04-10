const {
  playerJoin,
  getCurrentPlayerById,
  getCurrentPlayerByUsername,
  playerLeave,
  getTablePlayer,
} = require("./utils/players");

//oggetto che definsce la carte
var Carta = function (seme, valore) {
  var self = {
    seme: seme,
    valore: valore,
  };

  return self;
};

//crea il mazzo ordinato
var makeDeck = function () {
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
var estrazioneCasuale = function () {
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

//ordina la mano in ordine crescente
var ordinaMano = function (mano) {
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

//la squadra avanza di un posto e si prepara per la mano successiva
var avanzaPosti = function (players) {
  var temp = platers[3];
  for (var i = 3; i < 0; i--) {
    platers[i] = players[i - 1];
  }
  players[0] = temp;
  return players;
};

var initGame = function (platers) {
  var random = Math.floor(Math.random() * 4);
  var sockets = [];
  //ordino in base a un inizio casuale
  for (var i = 0; i < 4; i++) {
    sockets[i] = players[random % 4];
    players[random % 4].socket = io.sockets.connected[players[0].id6];
  }
  //sistemo in modo che i posti siano t1-t2-t1-t2
  if (sockets[0].team == 0) {
    if (sockets[1].team == 0) {
      var temp = sockets[1];
      sockets[1] = sockets[2];
      sockets[2] = temp;
    } else if (sockets[2] == 1) {
      var temp = sockets[2];
      sockets[2] = sockets[3];
      sockets[3] = temp;
    }
  }

  if (sockets[0].team == 1) {
    if (sockets[1].team == 1) {
      var temp = sockets[1];
      sockets[1] = sockets[2];
      sockets[2] = temp;
    } else if (sockets[2] == 0) {
      var temp = sockets[2];
      sockets[2] = sockets[3];
      sockets[3] = temp;
    }
  }
  //sistemati
  io.to(sockets[0].table).emit("gameIsStarting");
  giocaMano(sockets, 0, 0);
};

var mazzo = makeDeck();

var giocaMano = function (sockets, puntiPrimoTeam, puntiSecondoTeam) {
  //mischio il mazzo
  var numeri = estrazioneCasuale();

  //lista con tutti le mani
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

  //ASSEGNO LA MANO AD OGNI PLAYER

  for (var i = 0; i < 10; i++) {
    mano1[i] = mazzo[numeri[i] - 1];
  }
  mani[0] = ordinaMano(mano1);
  sockets[0].mano = mani[0];
  sockets[0].socket.emit("cardsDealing", { data: mani[0] });

  for (var i = 10; i < 20; i++) {
    mano2[i - 10] = mazzo[numeri[i] - 1];
  }
  mani[1] = ordinaMano(mano2);
  sockets[1].mano = mani[1];
  sockets[1].socket.emit("cardsDealing", { data: mani[1] });

  for (var i = 20; i < 30; i++) {
    mano3[i - 20] = mazzo[numeri[i] - 1];
  }
  mani[2] = ordinaMano(mano3);
  sockets[2].mano = mani[2];
  sockets[2].socket.emit("cardsDealing", { data: mani[2] });

  for (var i = 30; i < 40; i++) {
    mano4[i - 30] = mazzo[numeri[i] - 1];
  }
  mani[3] = ordinaMano(mano4);
  sockets[3].mano = mani[3];
  sockets[3].socket.emit("cardsDealing", { data: mani[3] });

  // FINISCO DI ASSEGNARE LA MANO AD OGNI PLAYER E INVIARLE AL CLIENT
};

modeule.exports = {
  giocaMano,
  initGame,
};
