import React from "react";
import { withRouter } from "react-router-dom";

import { Container, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

import PlayingCard from "./PlayingCard";

const Table = ({ socket, match }) => {
  const { username, table } = match.params;
  const [player, setPlayer] = useState({ isPlaying: 0, mano: [] });
  const [players, setPlayers] = useState([]);
  const [cards, setCards] = useState([
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
  ]);
  const [campo, setCampo] = useState([]);
  const [lastPlayed, setLastPlayed] = useState({});
  const [somme, setSomme] = useState(0);
  const [clicked, setClicked] = useState(0);

  const handleCardClick = (data) => {
    console.log(data);
    socket.emit("card", { id: player.id, data });
    setClicked(1);
  };

  //   const findPlayer = (username) => {
  //     for (let i = 0; i < playerList.length; ++i) {
  //       if (playerList[i].username === username) {
  //         setPlayer(playerList[i]);
  //         break;
  //       }
  //     }
  //   };

  useEffect(() => {
    socket.on("playerCards", ({ cards }) => {
      setCards(cards);
    });

    socket.on("tableCards", ({ campo, lastPlayedCard }) => {
      setCampo(campo);
      setLastPlayed(lastPlayedCard);
      //   console.log(campo);
    });
  }, [socket, cards, campo, lastPlayed]);

  useEffect(() => {
    socket.on("tablePlayers", ({ table, players }) => {
      setPlayers(players);
      for (let i = 0; i < players.length; ++i) {
        if (players[i].username === username) {
          setPlayer(players[i]);
          break;
        }
      }
      setClicked(0);
    });
  }, [socket, players, username]);

  return (
    <Container fluid style={{ backgroundColor: "#28a745", height: "100vh" }}>
      <h1 className="text-white">{table}</h1>
      {player.isPlaying ? (
        <h4 className="text-white text-center">Tocca a te giocare!</h4>
      ) : null}
      <hr />
      <Container>
        {campo.map((card, i) => (
          <Button
            key={i}
            variant="outline-light"
            onClick={() => handleCardClick(card)}
            disabled={!somme}
          >
            <PlayingCard seme={card.seme} valore={card.valore} />
          </Button>
        ))}
      </Container>
      <hr />
      <Container>
        {cards.map((card, i) => (
          <Button
            key={i}
            variant="outline-light"
            onClick={() => handleCardClick(card)}
            disabled={!player.isPlaying || clicked}
          >
            {card.seme}-{card.valore}
          </Button>
        ))}
      </Container>
    </Container>
  );
};

export default withRouter(Table);
