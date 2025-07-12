import React from 'react';

const MoveList = ({ moves }) => {
  return (
    <div className="move-list">
      <h3>Move History</h3>
      <div className="moves">
        {moves.map((move, index) => (
          <div key={index} className="move">
            {index % 2 === 0 && <span className="move-number">{Math.floor(index / 2) + 1}.</span>}
            <span>{move.notation}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoveList;