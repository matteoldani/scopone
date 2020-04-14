import React from "react";
import { Route, Switch } from "react-router-dom";
import io from "socket.io-client";
import EndRound from "./endround/EndRound";
import Table from "./Table";
import Team from "./Team";

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
    </Switch>
  );
};

export default GameContainer;
