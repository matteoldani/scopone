import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import { GameContext } from "../GameContext";
import PlayingCard from "../PlayingCard";
import WinnerCard from "./WinnerCard";

const EndRound = ({ history }) => {
  const {
    socket,
    table,
    username,
    player,
    players,
    playerOne,
    setResetting,
  } = useContext(GameContext);
  const [scores, setScores] = useState([
    {
      punti: 0,
      prese: [
        { valore: 3, seme: "S" },
        { valore: 3, seme: "D" },
      ],
      scope: [
        { valore: 3, seme: "C" },
        { valore: 10, seme: "D" },
      ],
    },
    {
      punti: 0,
      prese: [
        { valore: 3, seme: "C" },
        { valore: 3, seme: "D" },
      ],
      scope: [
        { valore: 3, seme: "S" },
        { valore: 3, seme: "D" },
      ],
    },
  ]);

  const [winner, setWinner] = useState(3);

  const nextRound = () => {
    socket.emit("nextRound", { table: player.table });
  };

  const gioca = () => {
    socket.emit("restartGame", { username, table });
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("prese", ({ data }) => {
      setScores([
        { prese: data.prese1, scope: data.scope1 },
        { prese: data.prese2, scope: data.scope2 },
      ]);
    });

    socket.on("punti", ({ puntiPrimoTeam, puntiSecondoTeam }) => {
      console.log("punti");
      setScores((prevScores) => [
        {
          ...prevScores[0],
          punti: puntiPrimoTeam,
        },
        {
          ...prevScores[1],
          punti: puntiSecondoTeam,
        },
      ]);
    });

    socket.on("winners", ({ team }) => {
      console.log("winners");
      setWinner(team + 1);
    });

    socket.on("gameRestarting", () => {
      setResetting(1);
      history.push("/game/team");
    });
  }, [socket, history, setResetting]);

  return (
    <Container>
      <br />
      <h1>Fine Round</h1>
      {players.map((player, i) => (
        <span key={i}>{player.username} </span>
      ))}
      <br />
      {winner === 3 ? (
        playerOne === player.username ? (
          <>
            <br />
            <Button onClick={nextRound} variant="success">
              Prossima Mano
            </Button>
            <br />
          </>
        ) : null
      ) : (
        <WinnerCard
          winner={winner}
          players={players.filter((player) => player.team === winner - 1)}
          gioca={gioca}
        />
      )}
      <br />
      <Row>
        {[0, 1].map((team) => (
          <Col key={team} sm={6} style={{ fontSize: 20 }}>
            <h2 className="text-muted">
              Team {team + 1} - {scores[team].punti} punti
            </h2>
            <hr />

            <p>Carte Prese</p>
            {scores[team].prese.map((card) => (
              <PlayingCard size="small" valore={card.valore} seme={card.seme} />
            ))}
            <hr />
            <p>Scope Fatte</p>
            {scores[team].scope.map((card) => (
              <PlayingCard size="small" valore={card.valore} seme={card.seme} />
            ))}

            <hr />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default withRouter(EndRound);
