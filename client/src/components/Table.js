import React from "react";

import { Container } from "react-bootstrap";
import { useState, useEffect } from "react";

const Table = ({ socket }) => {
  const [player, setPlayer] = useState({ mano: [] });
  //   const [hand, setHand] = useState([]);
  //   const [isPlaying, setIsPlaying] = useState();

  useEffect(() => {
    socket.on("playerData", ({ player }) => {
      console.log(player);

      setPlayer(player);
    });
  }, [socket, player]);

  return (
    <Container fluid style={{ backgroundColor: "#28a745", height: "100vh" }}>
      <h1>Hello table</h1>
      {player.mano.map((card, i) => (
        <p key={i}>{card.seme}</p>
      ))}
    </Container>
  );
};

export default Table;
