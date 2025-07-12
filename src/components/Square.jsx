import React from 'react';
import Piece from './Piece';

const Square = ({ x, y, piece, isSelected, onClick, isLight }) => {
  const squareColor = isSelected ? 'selected' : isLight ? 'light' : 'dark';
  
  return (
    <div 
      className={`square ${squareColor}`}
      onClick={onClick}
      data-x={x}
      data-y={y}
    >
      {piece && <Piece type={piece.type} color={piece.color} />}
    </div>
  );
};

export default Square;