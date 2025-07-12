import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import Timer from './components/Timer';
import MoveList from './components/MoveList';
import GameStatus from './components/GameStatus';
import { initializeBoard, movePiece, isCheck, isCheckmate, getLegalMoves } from './utils/chessLogic';
import './App.css';

const ChessGame = () => {
  const [board, setBoard] = useState(initializeBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [gameStatus, setGameStatus] = useState('ongoing');
  const [moveHistory, setMoveHistory] = useState([]);
  const [whiteTime, setWhiteTime] = useState(300); // 5 minutes in seconds
  const [blackTime, setBlackTime] = useState(300);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameStatus === 'ongoing') {
        if (currentPlayer === 'white') {
          setWhiteTime(prev => (prev > 0 ? prev - 1 : 0));
        } else {
          setBlackTime(prev => (prev > 0 ? prev - 1 : 0));
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayer, gameStatus]);

  // Check for game over conditions
  useEffect(() => {
    if (whiteTime === 0 || blackTime === 0) {
      setGameStatus('timeout');
      return;
    }

    const checkStatus = isCheck(board, currentPlayer);
    const mateStatus = isCheckmate(board, currentPlayer);

    if (mateStatus) {
      setGameStatus(`checkmate-${currentPlayer === 'white' ? 'black' : 'white'}`);
    } else if (checkStatus) {
      setGameStatus(`check-${currentPlayer}`);
    } else {
      setGameStatus('ongoing');
    }
  }, [board, currentPlayer, whiteTime, blackTime]);

  const handleSquareClick = useCallback((position) => {
    const [x, y] = position;
    
    // If no square is selected and the clicked square has a piece of the current player's color
    if (!selectedSquare && board[x][y] && board[x][y].color === currentPlayer) {
      setSelectedSquare(position);
      return;
    }

    // If a square is already selected
    if (selectedSquare) {
      // If clicking on the same square, deselect it
      if (x === selectedSquare[0] && y === selectedSquare[1]) {
        setSelectedSquare(null);
        return;
      }

      // If clicking on another piece of the same color, select that piece instead
      if (board[x][y] && board[x][y].color === currentPlayer) {
        setSelectedSquare(position);
        return;
      }

      // Attempt to make a move
      const legalMoves = getLegalMoves(board, selectedSquare);
      const isMoveLegal = legalMoves.some(move => move[0] === x && move[1] === y);

      if (isMoveLegal) {
        const moveResult = movePiece(
          board, 
          selectedSquare, 
          position, 
          currentPlayer, 
          moveHistory
        );

        if (moveResult) {
          const { newBoard, capturedPiece, moveNotation } = moveResult;
          
          // Update captured pieces if a piece was captured
          if (capturedPiece) {
            setCapturedPieces(prev => ({
              ...prev,
              [currentPlayer]: [...prev[currentPlayer], capturedPiece]
            }));
          }

          setBoard(newBoard);
          setMoveHistory(prev => [...prev, moveNotation]);
          setCurrentPlayer(prev => prev === 'white' ? 'black' : 'white');
          setSelectedSquare(null);
        }
      }
    }
  }, [board, currentPlayer, selectedSquare, moveHistory]);

  const undoLastMove = () => {
    if (moveHistory.length === 0) return;
    
    // Reset the board to initial state and replay all moves except the last one
    let tempBoard = initializeBoard();
    const newMoveHistory = [...moveHistory];
    newMoveHistory.pop();
    
    let tempCurrentPlayer = 'white';
    const tempCapturedPieces = { white: [], black: [] };
    
    newMoveHistory.forEach(move => {
      const result = movePiece(
        tempBoard, 
        move.from, 
        move.to, 
        tempCurrentPlayer,
        newMoveHistory
      );
      
      if (result) {
        tempBoard = result.newBoard;
        if (result.capturedPiece) {
          tempCapturedPieces[tempCurrentPlayer].push(result.capturedPiece);
        }
        tempCurrentPlayer = tempCurrentPlayer === 'white' ? 'black' : 'white';
      }
    });
    
    setBoard(tempBoard);
    setMoveHistory(newMoveHistory);
    setCurrentPlayer(tempCurrentPlayer);
    setCapturedPieces(tempCapturedPieces);
    setSelectedSquare(null);
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer('white');
    setGameStatus('ongoing');
    setMoveHistory([]);
    setWhiteTime(300);
    setBlackTime(300);
    setCapturedPieces({ white: [], black: [] });
    setSelectedSquare(null);
  };

  return (
    <div className="chess-game">
      <div className="game-container">
        <div className="player-info black-player">
          <Timer time={blackTime} isActive={currentPlayer === 'black' && gameStatus === 'ongoing'} />
          <div className="captured-pieces">
            {capturedPieces.black.map((piece, index) => (
              <span key={index} className={`piece ${piece.type}`}>{getPieceSymbol(piece)}</span>
            ))}
          </div>
        </div>
        
        <div className="board-container">
          <Board 
            board={board} 
            selectedSquare={selectedSquare} 
            onSquareClick={handleSquareClick} 
            currentPlayer={currentPlayer}
          />
          <GameStatus status={gameStatus} />
        </div>
        
        <div className="player-info white-player">
          <Timer time={whiteTime} isActive={currentPlayer === 'white' && gameStatus === 'ongoing'} />
          <div className="captured-pieces">
            {capturedPieces.white.map((piece, index) => (
              <span key={index} className={`piece ${piece.type}`}>{getPieceSymbol(piece)}</span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="game-controls">
        <MoveList moves={moveHistory} />
        <div className="buttons">
          <button onClick={undoLastMove} disabled={moveHistory.length === 0}>Undo</button>
          <button onClick={resetGame}>Reset Game</button>
        </div>
      </div>
    </div>
  );
};

// Helper function to display piece symbols
const getPieceSymbol = (piece) => {
  const symbols = {
    king: { white: '♔', black: '♚' },
    queen: { white: '♕', black: '♛' },
    rook: { white: '♖', black: '♜' },
    bishop: { white: '♗', black: '♝' },
    knight: { white: '♘', black: '♞' },
    pawn: { white: '♙', black: '♟' }
  };
  return symbols[piece.type][piece.color];
};

export default ChessGame;