import React from 'react';
import Square from './Square';
import '../App.css';

const Board = ({ board, selectedSquare, onSquareClick, currentPlayer }) => {
  const renderSquare = (x, y) => {
    const isSelected = selectedSquare && selectedSquare[0] === x && selectedSquare[1] === y;
    const piece = board[x][y];
    
    return (
      <Square
        key={`${x}-${y}`}
        x={x}
        y={y}
        piece={piece}
        isSelected={isSelected}
        onClick={() => onSquareClick([x, y])}
        isLight={(x + y) % 2 === 1}
      />
    );
  };

  return (
    <div className="board">
      {board.map((row, x) => (
        <div key={x} className="board-row">
          {row.map((_, y) => renderSquare(x, y))}
        </div>
      ))}
    </div>
  );
};

export default Board;