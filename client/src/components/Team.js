import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import { GameContext } from "./GameContext";

const Team = ({ history }) => {
  const {
    socket,
    table,
    username,
    players,
    setPlayers,
    playerOne,
    setPlayerOne,
    resetting,
    setResetting,
  } = useContext(GameContext);
  const [teamSize, setTeamSize] = useState(0);

  const cambiaTeam = () => {
    socket.emit("changeTeam", { username });
  };

  const gioca = () => {
    socket.emit("initGame", { username, table });
  };

  useEffect(() => {
    if (!socket) return;

    if (!resetting) {
      // join table
      console.log("rerender");
      socket.emit("joinTable", { username, table });

      socket.on("connectionError", ({ error }) => {
        alert(error);
        history.push("/");
      });
      setResetting(0);
    } else {
      setPlayers([...players]);
    }
    // get players for current table
    socket.on("tablePlayers", ({ table, players }) => {
      setPlayers(players);
      let count = 0;
      players.map((player) => (player.team === 0 ? (count += 1) : null));
      setTeamSize(count);
      console.log(count);
      setPlayerOne(players[0].username);
    });

    socket.on("gameIsStarting", () => {
      history.push("/game/table");
    });

    console.log(socket);
  }, [socket, history, username, table]);

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
        {[0, 1].map((team) => (
          <Col key={team} sm={6}>
            <h2 className="text-muted">Team {team + 1} </h2>
            <hr />
            {players.map((player) =>
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
            <Button
              style={{ width: "100%" }}
              disabled={players.length < 4 || teamSize !== 2}
              variant="success"
              onClick={gioca}
            >
              Gioca Ora{" [ " + players.length + "/4 giocatori ]"}
            </Button>
          ) : null}
        </Col>
      </Row>
    </Container>
  );
};

export default withRouter(Team);
