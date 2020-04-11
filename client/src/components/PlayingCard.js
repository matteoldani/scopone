import React from "react";

import { Button } from "react-bootstrap";

import { GiSpades, GiDiamonds, GiHearts, GiClubs } from "react-icons/gi";

const PlayingCard = ({ seme, valore, onClick, disabled }) => {
  return (
    <Button
      variant="light"
      style={{
        color: seme === "H" || seme === "D" ? "red" : null,
        height: 178,
        width: 114,
        fontSize: 25,
      }}
      onClick={onClick}
      disabled={disabled}
      className="m-2"
    >
      {seme === "S" ? (
        <>
          {valore} <GiSpades />
        </>
      ) : null}
      {seme === "H" ? (
        <>
          {valore} <GiHearts />
        </>
      ) : null}
      {seme === "D" ? (
        <>
          {valore} <GiDiamonds />
        </>
      ) : null}
      {seme === "C" ? (
        <>
          {valore} <GiClubs />
        </>
      ) : null}
    </Button>
  );
};

export default PlayingCard;
