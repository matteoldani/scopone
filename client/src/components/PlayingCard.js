import React from "react";

import { GiSpades } from "react-icons/gi";

const PlayingCard = ({ seme, valore }) => {
  return (
    <div>
      {seme}-{valore}
      <GiSpades />
    </div>
  );
};

export default PlayingCard;
