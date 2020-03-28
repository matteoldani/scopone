import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import io from "socket.io-client";

import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";

let socket;
const PLAYERS = [
  { name: "alberto", team: 0 },
  { name: "matteo", team: 0 },
  { name: "bruno", team: 1 },
  { name: "samuele", team: 1 }
];
const messages = [
  { username: "alberto", time: "16:18", text: "ciao ciao" },
  { username: "matteo", time: "16:19", text: "alberto sei intelligentissimo" },
  { username: "alberto", time: "16:19", text: "grazie" }
];

const Team = ({ match }) => {
  const { username, table } = match.params;
  const [players, setPlayers] = useState(PLAYERS);
  const SERVER = "localhost:8080";

  const cambiaTeam = () => {
    let temp = [...players];
    let curr = temp.findIndex(player => player.name === username);
    temp[curr].team = (temp[curr].team + 1) % 2;
    setPlayers(temp);
  };

  useEffect(() => {
    socket = io(SERVER);
    console.log(socket);
  }, [SERVER, match]);

  return (
    <Container>
      <br />
      <h3>
        Tavolo: {table} - Giocatore: {username}
      </h3>
      <h3></h3>
      <Button variant="success" onClick={cambiaTeam}>
        Cambia Team
      </Button>
      <br />
      <br />
      <Row>
        {[0, 1].map(team => (
          <Col key={team} sm={6}>
            <h2 className="text-muted">Team {team + 1}</h2>
            <hr />
            {players.map(player =>
              player.team === team ? (
                <h5
                  key={player.name}
                  className={username === player.name ? "text-success" : ""}
                >
                  {player.name}
                </h5>
              ) : null
            )}
            <hr />
          </Col>
        ))}
      </Row>
      <br />
      <Container>
        <Card body>
          <Container className="messages">
            {messages.map(message => (
              <>
                <span className="text-muted">{message.time}</span>{" "}
                <strong>{message.username}: </strong>
                {message.text}
                <br />
              </>
            ))}
          </Container>
          <br />
          <Form.Control type="text" />
        </Card>
      </Container>
    </Container>
  );
};

export default withRouter(Team);
