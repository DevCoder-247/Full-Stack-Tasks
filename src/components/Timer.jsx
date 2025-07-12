import React from 'react';

const Timer = ({ time, isActive }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  
  return (
    <div className={`timer ${isActive ? 'active' : 'inactive'}`}>
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
};

export default Timer;