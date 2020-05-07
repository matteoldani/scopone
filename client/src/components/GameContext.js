import React, { useState } from "react";

export const GameContext = React.createContext();

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  const [table, setTable] = useState("");
  const [username, setUsername] = useState("");
  const [player, setPlayer] = useState({ isPlaying: 0, mano: [] });
  const [players, setPlayers] = useState([
    { username: "Alberto", team: 0 },
    { username: "Matteo", team: 0 },
    { username: "Giuseppe Conte", team: 1 },
    { username: "Ferruccio Resta", team: 1 },
  ]);
  const [playerOne, setPlayerOne] = useState("alberto");
  const [resetting, setResetting] = useState(0);

  return (
    <GameContext.Provider
      value={{
        socket,
        setSocket,
        table,
        setTable,
        username,
        setUsername,
        player,
        setPlayer,
        players,
        setPlayers,
        playerOne,
        setPlayerOne,
        resetting,
        setResetting,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
