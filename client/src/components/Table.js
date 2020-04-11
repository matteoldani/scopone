import React, { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import { GameContext } from "./GameContext";
import PlayingCard from "./PlayingCard";

const Table = ({ socket, match }) => {
  const { username, setUsername, table, setTable } = useContext(GameContext);
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
    <Container fluid style={{ backgroundColor: "#28a745", minHeight: "100vh" }}>
      <h1 className="text-white">{table}</h1>
      <strong>Giocatori:</strong>{" "}
      {players.map((p) => (
        <span
          style={{ color: p.isPlaying === 1 ? "white" : null, marginLeft: 10 }}
        >
          {p.username},
        </span>
      ))}
      <br />
      <strong>Ultima carta giocata: </strong>
      <span>
        {lastPlayed.seme} {lastPlayed.valore}
      </span>
      {player.isPlaying ? (
        <h4 className="text-white text-center">Tocca a te giocare!</h4>
      ) : null}
      <hr />
      <h4>Campo</h4>
      <Container fluid style={{ minHeight: 100 }}>
        {campo.map((card, i) => (
          //   <Button
          //     key={i}
          //     variant="outline-light"
          //     onClick={() => handleCardClick(card)}
          //     disabled={!somme}
          //   >
          <PlayingCard
            seme={card.seme}
            valore={card.valore}
            onClick={() => handleCardClick(card)}
            disabled={!somme}
          />
        ))}
      </Container>
      <hr />
      <h4>Mano</h4>
      <Container fluid>
        {cards.map((card, i) => (
          //   <Button
          //     className="mr-2"
          //     key={i}
          //     variant="outline-light"
          //     onClick={() => handleCardClick(card)}
          //     disabled={!player.isPlaying || clicked}
          //   >
          //   </Button>
          <PlayingCard
            seme={card.seme}
            valore={card.valore}
            onClick={() => handleCardClick(card)}
            disabled={!player.isPlaying || clicked}
          />
        ))}
      </Container>
    </Container>
  );
};

export default withRouter(Table);
