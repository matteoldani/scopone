const players = [];

// join player to the table
function playerJoin(id, username, table) {
    const plater = { id, username, table };
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
  