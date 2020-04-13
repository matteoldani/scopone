import React, { useEffect } from "react";
import { Switch, Route } from "react-router-dom";

import io from "socket.io-client";

import Table from "./Table";
import Team from "./Team";
import EndRound from "./EndRound";
import EndGame from "./EndGame";

let socket;
const SERVER = "localhost:8081";
socket = io(SERVER);

const GameContainer = () => {
  return (
    <Switch>
      <Route path="/team" exact component={() => <Team socket={socket} />} />
      <Route path="/table" exact component={() => <Table socket={socket} />} />
      <Route
        path="/round"
        exact
        component={() => <EndRound socket={socket} />}
      />
      <Route
        path="/endgame"
        exact
        component={() => <EndGame socket={socket} />}
      />
    </Switch>
  );
};

export default GameContainer;
