import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import io from "socket.io-client";

import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

let socket;

// const messages = [
//   { username: "alberto", time: "16:18", text: "ciao ciao" },
//   { username: "matteo", time: "16:19", text: "alberto sei intelligentissimo" },
//   { username: "alberto", time: "16:19", text: "grazie" }
// ];

const Team = ({ match, history }) => {
  const { username, table } = match.params;
  const [players, setPlayers] = useState([]);
  const [playerOne, setPlayerOne] = useState("");
  const [teamSize, setTeamSize] = useState(0);
  const SERVER = "localhost:8080";

  const cambiaTeam = () => {
    socket.emit("changeTeam", { username });
  };

  const gioca = () => {
    socket.emit("initGame", { username, table });
  };

  useEffect(() => {
    socket = io(SERVER);

    // join table
    socket.emit("joinTable", match.params);

    socket.on("connectionError", ({ error }) => {
      alert(error);
      //   socket.emit("forceDisconnect");
      history.push("/");
    });

    // get players for current table
    socket.on("tablePlayers", ({ table, players }) => {
      setPlayers(players);
      let count = 0;
      players.map(player => (player.team === 0 ? (count += 1) : null));
      setTeamSize(count);
      console.log(count);
      setPlayerOne(players[0].username);
    });

    console.log(socket);
  }, [SERVER, match, history]);

  return (
    <Container>
      <br />

      <p>
        <span className="text-muted">Tavolo:</span> {table}{" "}
      </p>
      <p>
        <span className="text-muted">Giocatore:</span> {username}
      </p>

      <br />
      <Row>
        {[0, 1].map(team => (
          <Col key={team} sm={6}>
            <h2 className="text-muted">Team {team + 1} </h2>
            <hr />
            {players.map(player =>
              player.team === team ? (
                <h5
                  key={player.id}
                  className={username === player.username ? "text-success" : ""}
                >
                  {player.username}
                </h5>
              ) : null
            )}
            <hr />
          </Col>
        ))}
      </Row>
      <br />
      <Row>
        <Col sm={6}>
          <br />
          <Button
            style={{ width: "100%" }}
            variant="outline-success"
            onClick={cambiaTeam}
          >
            Cambia Team
          </Button>
        </Col>
        <Col sm={6}>
          <br />
          {username === playerOne ? (
            <LinkContainer to="/table" style={{ width: "100%" }}>
              <Button
                disabled={players.length < 4 || teamSize !== 2}
                variant="success"
                onClick={gioca}
              >
                Gioca Ora{" [ " + players.length + "/4 giocatori ]"}
              </Button>
            </LinkContainer>
          ) : null}
        </Col>
      </Row>
      {/* <Container>
        <Card body>
          <Container className="messages">
            {messages.map(message => (
              <span>
                <span className="text-muted">{message.time}</span>{" "}
                <strong>{message.username}: </strong>
                {message.text}
                <br />
              </span>
            ))}
          </Container>
          <br />
          <Form.Control type="text" />
        </Card>
      </Container> */}
    </Container>
  );
};

export default withRouter(Team);
