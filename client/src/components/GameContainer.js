import React from "react";
import { Route, Switch } from "react-router-dom";
import io from "socket.io-client";
import EndRound from "./endround/EndRound";
import Table from "./Table";
import Team from "./Team";
import { useEffect } from "react";
import { useContext } from "react";
import { GameContext } from "./GameContext";

const GameContainer = () => {
  const { setSocket } = useContext(GameContext);
  const SERVER = "http://localhost:8081/";

  useEffect(() => {
    setSocket(io(SERVER));
  }, [setSocket]);

  return (
    <Switch>
      <Route path="/game/team" exact component={Team} />
      <Route path="/game/table" exact component={Table} />
      <Route path="/game/round" exact component={EndRound} />
    </Switch>
  );
};

export default GameContainer;
