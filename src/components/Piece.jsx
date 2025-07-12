import React from 'react';

const Piece = ({ type, color }) => {
  const symbols = {
    king: { white: '♔', black: '♚' },
    queen: { white: '♕', black: '♛' },
    rook: { white: '♖', black: '♜' },
    bishop: { white: '♗', black: '♝' },
    knight: { white: '♘', black: '♞' },
    pawn: { white: '♙', black: '♟' }
  };
  
  return (
    <span className={`piece ${type} ${color}`}>
      {symbols[type][color]}
    </span>
  );
};

export default Piece;