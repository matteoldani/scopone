import React, { useState } from "react";

export const GameContext = React.createContext();

export const GameProvider = (props) => {
  const [table, setTable] = useState("");
  const [username, setUsername] = useState("");
  return (
    <GameContext.Provider value={{ table, setTable, username, setUsername }}>
      {props.children}
    </GameContext.Provider>
  );
};
