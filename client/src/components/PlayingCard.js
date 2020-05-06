import React from "react";
import { Button } from "react-bootstrap";
import { GiClubs, GiDiamonds, GiHearts, GiSpades } from "react-icons/gi";

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
        opacity: 1,
        border: disabled ? "2px solid black" : "3px solid red",
        boxShadow: "4px 4px 10px 0 rgba(0, 0, 0, 0.2)",
        cursor: disabled ? "default" : null,
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
