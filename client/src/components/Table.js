import React from "react";

import io from "socket.io-client";

import { Container } from "react-bootstrap";
import { useState, useEffect } from "react";

let socket;

const Table = () => {
  const [hand, setHand] = useState([]);

  const SERVER = "localhost:8080";

  useEffect(() => {
    socket = io(SERVER);

    socket.on("cardsDealing", ({ myHand }) => {
      setHand(myHand);
    });
  }, [SERVER, hand]);

  return (
    <Container fluid style={{ backgroundColor: "#28a745", height: "100vh" }}>
      <h1>Hello table</h1>
      {hand.map((card) => (
        <p>{hand}</p>
      ))}
    </Container>
  );
};

export default Table;
