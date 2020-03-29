const players = [];

// join player to the table
function playerJoin(id, username, table) {
    const player = { id, username, table, team:0, mano:[]};

    //assegno il team
    currentPlayers = getTablePlayer(table);
    var t1 = 0;
    var t2 = 0;
    for(var i=0; i<currentPlayers.length; i++){
      if(currentPlayers[i].team == 0){
        t1++;
      }else {
        t2++;
      }
    }
    if(t1<=t2){
      player.team = 0;
    }else {
      player.team = 1;
    }
    // fine assegnazione team

    players.push(player);
    return player;
  }

  // get current player
  function getCurrentPlayer(id) {
    return players.find(player => player.id === id);
  }

  // player leaves the game
  function playerLeave(id) {
    const index = players.findIndex(player => player.id === id);
    if (index !== -1) {
      return players.splice(index, 1)[0];
    }
  }

  // get room users
  function getTablePlayer(table) {
    return players.filter(player => player.table === table);
  }

  module.exports = {
    playerJoin,
    getCurrentPlayer,
    playerLeave,
    getTablePlayer
  };
