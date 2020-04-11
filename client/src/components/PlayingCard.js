import React from "react";

import { GiSpades, GiDiamonds, GiHearts, GiClubs } from "react-icons/gi";

const PlayingCard = ({ seme, valore }) => {
  return (
    <div>
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
    </div>
  );
};

export default PlayingCard;
