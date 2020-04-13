import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { GameContext } from "./GameContext";
import PlayingCard from "./PlayingCard";

const EndRound = ({ socket, history }) => {
  const { table, setTable, username, setUsername } = useContext(GameContext);
  const [scores, setScores] = useState([
    {
      punti: 0,
      prese: [
        { valore: 3, seme: "S" },
        { valore: 3, seme: "D" },
      ],
      scope: [
        { valore: 3, seme: "C" },
        { valore: 3, seme: "D" },
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

  useEffect(() => {
    socket.on("prese", ({ data }) => {
      setScores([
        { prese: data.prese1, scope: data.scope1 },
        { prese: data.prese2, scope: data.scope2 },
      ]);
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
      <br />
      <h1>Fine Round</h1>
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

export default EndRound;
