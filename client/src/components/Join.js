import React from "react";
import { Form, Button, Container } from "react-bootstrap";

import { LinkContainer } from "react-router-bootstrap";
import { useState } from "react";

const Join = () => {
  const [name, setName] = useState("");
  const [table, setTable] = useState("");

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
            onChange={e => {
              setName(e.target.value);
            }}
          />
        </Form.Group>

        <Form.Group controlId="formRoom">
          <Form.Label>Tavolo</Form.Label>
          <Form.Control
            type="text"
            placeholder="Codice Tavolo"
            onChange={e => {
              setTable(e.target.value);
            }}
          />
        </Form.Group>
        <LinkContainer
          onClick={e => (!name || !table ? e.preventDefault() : null)}
          to={"/team/" + table + "/" + name}
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
