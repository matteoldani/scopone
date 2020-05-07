import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import GameContainer from "./components/GameContainer";
import { GameProvider } from "./components/GameContext";
import Join from "./components/Join";

const App = () => {
  return (
    <Router>
      <GameProvider>
        <Route path="/" exact component={Join} />
        <Route path="/game" component={GameContainer} />
      </GameProvider>
    </Router>
  );
};

export default App;
