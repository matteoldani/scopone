import React, { useContext, useEffect } from "react";
import { Container } from "react-bootstrap";
import { GameContext } from "./GameContext";

const EndRound = ({ socket, history }) => {
  const { table, setTable, username, setUsername } = useContext(GameContext);

  useEffect(() => {
    socket.on("prese", ({ data }) => {
      console.log(data);
      console.log(data.prese1);
    });

    socket.on("punti", () => {
      console.log("punti");
    });

    socket.on("winners", () => {
      console.log("winners");
    });
  }, [socket, history]);

  return (
    <Container>
      <h1>Hello this is the end of a round</h1>
    </Container>
  );
};

export default EndRound;
