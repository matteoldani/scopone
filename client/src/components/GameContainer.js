import React, { useEffect } from "react";
import { Switch, Route } from "react-router-dom";

import io from "socket.io-client";

import Table from "./Table";
import Team from "./Team";
import FineMano from "./FineMano";
import FinePartita from "./FinePartita";

let socket;
const SERVER = "localhost:8081";
socket = io(SERVER);

const GameContainer = () => {
  return (
    <Switch>
      <Route path="/team" exact component={() => <Team socket={socket} />} />
      <Route path="/table" exact component={() => <Table socket={socket} />} />
      <Route
        path="/finemano"
        exact
        component={() => <FineMano socket={socket} />}
      />
      <Route
        path="/finepartita"
        exact
        component={() => <FinePartita socket={socket} />}
      />
    </Switch>
  );
};

export default GameContainer;
