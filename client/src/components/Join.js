import React, { useContext } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { GameContext } from "./GameContext";

const Join = () => {
  const { table, setTable, username, setUsername } = useContext(GameContext);

  return (
    <Container>
      <br />
      <h1>Scopone</h1>
      <h6 className="text-muted">
        by{" "}
        <a
          href="https://matteoldani.it"
          target="_blank"
          rel="noopener noreferrer"
        >
          Matteo Oldani
        </a>
        ,{" "}
        <a
          href="https://albertomosconi.it"
          target="_blank"
          rel="noopener noreferrer"
        >
          Alberto Mosconi
        </a>
      </h6>
      <br />
      <Form>
        <Form.Group controlId="formNickname">
          <Form.Label>Nickname</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nickname"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </Form.Group>

        <Form.Group controlId="formRoom">
          <Form.Label>Tavolo</Form.Label>
          <Form.Control
            type="text"
            placeholder="Codice Tavolo"
            onChange={(e) => {
              setTable(e.target.value);
            }}
          />
        </Form.Group>
        <LinkContainer
          onClick={(e) => (!username || !table ? e.preventDefault() : null)}
          to={"/game/team"}
        >
          <Button variant="success" type="submit">
            Gioca
          </Button>
        </LinkContainer>
      </Form>
    </Container>
  );
};

export default Join;
