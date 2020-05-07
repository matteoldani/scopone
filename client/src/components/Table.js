import React, { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import { GameContext } from "./GameContext";
import PlayingCard from "./PlayingCard";

const Table = ({ history }) => {
  const {
    socket,
    username,
    table,
    player,
    setPlayer,
    players,
    setPlayers,
  } = useContext(GameContext);
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
  const [selectedCards, setSelectedCards] = useState([]);
  const [clicked, setClicked] = useState(0);

  const handleCardClick = (data) => {
    console.log(data);
    socket.emit("card", { id: player.id, data });
    setLastPlayed(data);
    setClicked(1);
  };

  const handleSelectCard = (data) => {
    let tot = 0;
    for (let i = 0; i < selectedCards.length; ++i) {
      tot += selectedCards[i].valore;
    }
    let newTot = data.valore + tot;
    if (newTot === lastPlayed.valore) {
      console.log("somma ok");
      socket.emit("somma", {
        id: player.id,
        data: [...selectedCards, data],
        last: lastPlayed,
      });
      setSelectedCards([]);
      setSomme(0);
    } else if (newTot < lastPlayed.valore) {
      setSelectedCards([...selectedCards, data]);
      console.log("somma non completa");
    } else {
      setSelectedCards([]);
      console.log("somma sbagliata");
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("playerCards", ({ cards }) => {
      setCards(cards);
    });

    socket.on("tableCards", ({ campo, lastPlayedCard }) => {
      setCampo(campo);
      setLastPlayed(lastPlayedCard);
    });

    socket.on("sommeMultiple", () => {
      setSomme(1);
    });
  }, [socket, cards, campo, lastPlayed]);

  useEffect(() => {
    if (!socket) return;
    socket.on("tablePlayers", ({ table, players }) => {
      setPlayers(players);
      for (let i = 0; i < players.length; ++i) {
        if (players[i].username === username) {
          setPlayer(players[i]);
          break;
        }
      }
      console.log(players);
      setClicked(0);
    });

    socket.on("endRound", () => {
      history.push("/game/round");
    });
  }, [socket, history, setPlayer, players, setPlayers, username]);

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
      <PlayingCard
        size="small"
        seme={lastPlayed.seme}
        valore={lastPlayed.valore}
      />
      {player.isPlaying ? (
        <h4 className="text-white text-center">Tocca a te giocare!</h4>
      ) : null}
      <hr />
      <h4>Campo</h4>
      <Container fluid style={{ minHeight: 100 }}>
        {campo.map((card, i) => (
          <PlayingCard
            size="large"
            seme={card.seme}
            valore={card.valore}
            onClick={() => handleSelectCard(card)}
            disabled={!somme || selectedCards.includes(card)}
          />
        ))}
      </Container>
      <hr />
      <h4>Mano</h4>
      <Container fluid>
        {cards.map((card, i) => (
          <PlayingCard
            key={i}
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
