import React from "react";
import { withRouter } from "react-router-dom";

import { Container, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

const Table = ({ socket, match }) => {
  const { username, table } = match.params;
  const [player, setPlayer] = useState({
    mano: [
      { seme: "D", valore: 1 },
      { seme: "S", valore: 2 },
      { seme: "C", valore: 2 },
      { seme: "C", valore: 3 },
      { seme: "S", valore: 4 },
      { seme: "S", valore: 5 },
      { seme: "C", valore: 6 },
      { seme: "C", valore: 9 },
      { seme: "S", valore: 9 },
      { seme: "H", valore: 10 },
    ],
  });
  const [campo, setCampo] = useState([]);

  const handleCardClick = (data) => {
    console.log(data);
    socket.emit("card", data);
  };

  useEffect(() => {
    socket.on("playerData", ({ player }) => {
      console.log(player);

      setPlayer(player);
    });

    socket.on("tableCards", ({ campo, lastPlayedCard }) => {
      setCampo(campo);
      console.log(campo);
    });
  }, [socket, player, campo]);

  return (
    <Container fluid style={{ backgroundColor: "#28a745", height: "100vh" }}>
      <h1 className="text-white">{table}</h1>
      <hr />
      <Container>
        {campo.map((card, i) => (
          <Button
            key={i}
            variant="outline-light"
            onClick={() => handleCardClick(card)}
            disabled={!player.isPlaying}
          >
            {card.seme}-{card.valore}
          </Button>
        ))}
      </Container>
      <hr />
      <Container>
        {player.mano.map((card, i) => (
          <Button
            key={i}
            variant="outline-light"
            onClick={() => handleCardClick(card)}
            disabled={!player.isPlaying}
          >
            {card.seme}-{card.valore}
          </Button>
        ))}
      </Container>
    </Container>
  );
};

export default withRouter(Table);
