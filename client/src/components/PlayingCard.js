import React from "react";

import { Button } from "react-bootstrap";

import { GiSpades, GiDiamonds, GiHearts, GiClubs } from "react-icons/gi";

const PlayingCard = ({ seme, valore, onClick, disabled, size, style }) => {
  return size === "small" ? (
    <span>
      {valore}
      {seme === "S" ? <span>&spades; </span> : null}
      {seme === "H" ? <span>&hearts; </span> : null}
      {seme === "D" ? <span>&diams; </span> : null}
      {seme === "C" ? <span>&clubs; </span> : null}{" "}
    </span>
  ) : (
    <Button
      variant="light"
      style={{
        ...style,
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
