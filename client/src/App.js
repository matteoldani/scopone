import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import Join from "./components/Join";
import Table from "./components/Table";
import Team from "./components/Team";
import FineMano from "./components/FineMano";
import FinePartita from "./components/FinePartita";

const App = () => {
  return (
    <Router>
      <Route path="/" exact component={Join} />
      <Route path="/team/:table/:username" exact component={Team} />
      <Route path="/table" exact component={Table} />
      <Route path="/finemano" exact component={FineMano} />
      <Route path="/finepartita" exact component={FinePartita} />
    </Router>
  );
};

export default App;
