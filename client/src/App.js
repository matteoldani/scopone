import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import Join from "./components/Join";
import GameContainer from "./components/GameContainer";

const App = () => {
  return (
    <Router>
      <Route path="/" exact component={Join} />
      <GameContainer />
    </Router>
  );
};

export default App;
