import React from "react";
import { Route, Switch } from "react-router-dom";
import io from "socket.io-client";
import EndRound from "./endround/EndRound";
import Table from "./Table";
import Team from "./Team";

const GameContainer = () => {
  let socket;
  const SERVER = "localhost:8081";
  socket = io(SERVER);
  return (
    <Switch>
      <Route
        path="/game/team"
        exact
        component={() => <Team socket={socket} />}
      />
      <Route
        path="/game/table"
        exact
        component={() => <Table socket={socket} />}
      />
      <Route
        path="/game/round"
        exact
        component={() => <EndRound socket={socket} />}
      />
    </Switch>
  );
};

export default GameContainer;
