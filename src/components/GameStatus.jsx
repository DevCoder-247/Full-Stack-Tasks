import React from 'react';

const GameStatus = ({ status }) => {
  let message = '';
  
  switch (status) {
    case 'ongoing':
      message = 'Game in progress';
      break;
    case 'check-white':
      message = 'White is in check!';
      break;
    case 'check-black':
      message = 'Black is in check!';
      break;
    case 'checkmate-white':
      message = 'Checkmate! White wins!';
      break;
    case 'checkmate-black':
      message = 'Checkmate! Black wins!';
      break;
    case 'timeout':
      message = 'Time out!';
      break;
    default:
      message = '';
  }
  
  return (
    <div className={`game-status ${status}`}>
      {message}
    </div>
  );
};

export default GameStatus;