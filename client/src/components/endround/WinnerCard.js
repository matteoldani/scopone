import React from "react";
import { Card, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const EndGame = ({ winner, players }) => {
  return (
    <>
      <br />
      <Card
        bg="success"
        text="light"
        style={{
          textAlign: "center",
          width: "60%",
          margin: "0 auto",
        }}
      >
        <Card.Header>Gioco Finito</Card.Header>
        <Card.Body>
          <Card.Title>Team {winner} is the winner! </Card.Title>
          <Card.Text>
            {players[0].username} e {players[1].username} sono i giocatori
            migliori di sempre.
          </Card.Text>
          <Button>Gioca Ancora</Button>
        </Card.Body>
      </Card>
    </>
  );
};

export default EndGame;
