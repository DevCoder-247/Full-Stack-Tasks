export const initializeBoard = () => {
  const board = Array(8).fill().map(() => Array(8).fill(null));
  
  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
    board[6][i] = { type: 'pawn', color: 'white' };
  }
  
  // Set up rooks
  board[0][0] = board[0][7] = { type: 'rook', color: 'black' };
  board[7][0] = board[7][7] = { type: 'rook', color: 'white' };
  
  // Set up knights
  board[0][1] = board[0][6] = { type: 'knight', color: 'black' };
  board[7][1] = board[7][6] = { type: 'knight', color: 'white' };
  
  // Set up bishops
  board[0][2] = board[0][5] = { type: 'bishop', color: 'black' };
  board[7][2] = board[7][5] = { type: 'bishop', color: 'white' };
  
  // Set up queens
  board[0][3] = { type: 'queen', color: 'black' };
  board[7][3] = { type: 'queen', color: 'white' };
  
  // Set up kings
  board[0][4] = { type: 'king', color: 'black' };
  board[7][4] = { type: 'king', color: 'white' };
  
  return board;
};

export const movePiece = (board, from, to, currentPlayer, moveHistory) => {
  const [fromX, fromY] = from;
  const [toX, toY] = to;
  const piece = board[fromX][fromY];
  
  if (!piece || piece.color !== currentPlayer) return null;
  
  const legalMoves = getLegalMoves(board, from);
  const isLegal = legalMoves.some(([x, y]) => x === toX && y === toY);
  
  if (!isLegal) return null;
  
  // Create a deep copy of the board
  const newBoard = board.map(row => [...row]);
  
  // Check for castling
  if (piece.type === 'king' && Math.abs(fromY - toY) === 2) {
    // Castle move
    const direction = toY > fromY ? 1 : -1;
    const rookY = direction > 0 ? 7 : 0;
    const newRookY = toY - direction;
    
    // Move rook
    newBoard[toX][newRookY] = newBoard[fromX][rookY];
    newBoard[fromX][rookY] = null;
  }
  
  // Check for en passant
  if (piece.type === 'pawn' && fromY !== toY && !newBoard[toX][toY]) {
    // Remove the captured pawn
    newBoard[fromX][toY] = null;
  }
  
  // Check for pawn promotion
  let promotedPiece = piece;
  if (piece.type === 'pawn' && (toX === 0 || toX === 7)) {
    promotedPiece = { type: 'queen', color: piece.color }; // Auto-promote to queen for simplicity
  }
  
  // Capture the piece if the square is occupied
  const capturedPiece = newBoard[toX][toY];
  
  // Move the piece
  newBoard[toX][toY] = promotedPiece;
  newBoard[fromX][fromY] = null;
  
  // Generate move notation
  const moveNotation = generateMoveNotation(board, from, to, capturedPiece, promotedPiece !== piece);
  
  return {
    newBoard,
    capturedPiece,
    moveNotation: {
      from,
      to,
      notation: moveNotation
    }
  };
};

export const getLegalMoves = (board, position) => {
  const [x, y] = position;
  const piece = board[x][y];
  
  if (!piece) return [];
  
  const moves = [];
  
  switch (piece.type) {
    case 'pawn':
      getPawnMoves(board, x, y, piece.color, moves);
      break;
    case 'rook':
      getRookMoves(board, x, y, piece.color, moves);
      break;
    case 'knight':
      getKnightMoves(board, x, y, piece.color, moves);
      break;
    case 'bishop':
      getBishopMoves(board, x, y, piece.color, moves);
      break;
    case 'queen':
      getRookMoves(board, x, y, piece.color, moves);
      getBishopMoves(board, x, y, piece.color, moves);
      break;
    case 'king':
      getKingMoves(board, x, y, piece.color, moves);
      break;
  }
  
  // Filter out moves that would leave the king in check
  return moves.filter(([newX, newY]) => {
    // Simulate the move
    const tempBoard = board.map(row => [...row]);
    tempBoard[newX][newY] = tempBoard[x][y];
    tempBoard[x][y] = null;
    
    // Find the king's position
    let kingX, kingY;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (tempBoard[i][j] && tempBoard[i][j].type === 'king' && tempBoard[i][j].color === piece.color) {
          kingX = i;
          kingY = j;
          break;
        }
      }
    }
    
    return !isSquareUnderAttack(tempBoard, kingX, kingY, piece.color === 'white' ? 'black' : 'white');
  });
};

const getPawnMoves = (board, x, y, color, moves) => {
  const direction = color === 'white' ? -1 : 1;
  
  // Forward move
  if (isInBounds(x + direction, y) && !board[x + direction][y]) {
    moves.push([x + direction, y]);
    
    // Double move from starting position
    const startRow = color === 'white' ? 6 : 1;
    if (x === startRow && !board[x + 2 * direction][y]) {
      moves.push([x + 2 * direction, y]);
    }
  }
  
  // Captures
  for (const dy of [-1, 1]) {
    const newY = y + dy;
    if (isInBounds(x + direction, newY)) {
      // Regular capture
      if (board[x + direction][newY] && board[x + direction][newY].color !== color) {
        moves.push([x + direction, newY]);
      }
      
      // TODO: Implement en passant
    }
  }
};

const getRookMoves = (board, x, y, color, moves) => {
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  
  for (const [dx, dy] of directions) {
    for (let i = 1; i < 8; i++) {
      const newX = x + i * dx;
      const newY = y + i * dy;
      
      if (!isInBounds(newX, newY)) break;
      
      if (!board[newX][newY]) {
        moves.push([newX, newY]);
      } else {
        if (board[newX][newY].color !== color) {
          moves.push([newX, newY]);
        }
        break;
      }
    }
  }
};

const getKnightMoves = (board, x, y, color, moves) => {
  const knightMoves = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ];
  
  for (const [dx, dy] of knightMoves) {
    const newX = x + dx;
    const newY = y + dy;
    
    if (isInBounds(newX, newY) && (!board[newX][newY] || board[newX][newY].color !== color)) {
      moves.push([newX, newY]);
    }
  }
};

const getBishopMoves = (board, x, y, color, moves) => {
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  
  for (const [dx, dy] of directions) {
    for (let i = 1; i < 8; i++) {
      const newX = x + i * dx;
      const newY = y + i * dy;
      
      if (!isInBounds(newX, newY)) break;
      
      if (!board[newX][newY]) {
        moves.push([newX, newY]);
      } else {
        if (board[newX][newY].color !== color) {
          moves.push([newX, newY]);
        }
        break;
      }
    }
  }
};

const getKingMoves = (board, x, y, color, moves) => {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      
      const newX = x + dx;
      const newY = y + dy;
      
      if (isInBounds(newX, newY) && (!board[newX][newY] || board[newX][newY].color !== color)) {
        moves.push([newX, newY]);
      }
    }
  }
  
  // TODO: Implement castling
};

const isSquareUnderAttack = (board, x, y, byColor) => {
  // Check for pawn attacks
  const pawnDirection = byColor === 'white' ? 1 : -1;
  for (const dy of [-1, 1]) {
    const newX = x + pawnDirection;
    const newY = y + dy;
    if (isInBounds(newX, newY) && 
        board[newX][newY] && 
        board[newX][newY].type === 'pawn' && 
        board[newX][newY].color === byColor) {
      return true;
    }
  }
  
  // Check for knight attacks
  const knightMoves = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ];
  
  for (const [dx, dy] of knightMoves) {
    const newX = x + dx;
    const newY = y + dy;
    if (isInBounds(newX, newY) && 
        board[newX][newY] && 
        board[newX][newY].type === 'knight' && 
        board[newX][newY].color === byColor) {
      return true;
    }
  }
  
  // Check for rook/queen attacks (straight lines)
  const rookDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [dx, dy] of rookDirections) {
    for (let i = 1; i < 8; i++) {
      const newX = x + i * dx;
      const newY = y + i * dy;
      
      if (!isInBounds(newX, newY)) break;
      
      if (board[newX][newY]) {
        if (board[newX][newY].color === byColor && 
            (board[newX][newY].type === 'rook' || board[newX][newY].type === 'queen')) {
          return true;
        }
        break;
      }
    }
  }
  
  // Check for bishop/queen attacks (diagonals)
  const bishopDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [dx, dy] of bishopDirections) {
    for (let i = 1; i < 8; i++) {
      const newX = x + i * dx;
      const newY = y + i * dy;
      
      if (!isInBounds(newX, newY)) break;
      
      if (board[newX][newY]) {
        if (board[newX][newY].color === byColor && 
            (board[newX][newY].type === 'bishop' || board[newX][newY].type === 'queen')) {
          return true;
        }
        break;
      }
    }
  }
  
  // Check for king attacks (adjacent squares)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      
      const newX = x + dx;
      const newY = y + dy;
      
      if (isInBounds(newX, newY) && 
          board[newX][newY] && 
          board[newX][newY].type === 'king' && 
          board[newX][newY].color === byColor) {
        return true;
      }
    }
  }
  
  return false;
};

export const isCheck = (board, color) => {
  // Find the king's position
  let kingX, kingY;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j] && board[i][j].type === 'king' && board[i][j].color === color) {
        kingX = i;
        kingY = j;
        break;
      }
    }
  }
  
  return isSquareUnderAttack(board, kingX, kingY, color === 'white' ? 'black' : 'white');
};

export const isCheckmate = (board, color) => {
  if (!isCheck(board, color)) return false;
  
  // Check if any piece has a legal move that would get out of check
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j] && board[i][j].color === color) {
        const legalMoves = getLegalMoves(board, [i, j]);
        if (legalMoves.length > 0) {
          return false;
        }
      }
    }
  }
  
  return true;
};

const isInBounds = (x, y) => x >= 0 && x < 8 && y >= 0 && y < 8;

const generateMoveNotation = (board, from, to, capturedPiece, isPromotion) => {
  const [fromX, fromY] = from;
  const [toX, toY] = to;
  const piece = board[fromX][fromY];
  const file = String.fromCharCode(97 + fromY);
  const rank = 8 - fromX;
  const destFile = String.fromCharCode(97 + toY);
  const destRank = 8 - toX;
  
  // Castling
  if (piece.type === 'king' && Math.abs(fromY - toY) === 2) {
    return toY > fromY ? 'O-O' : 'O-O-O';
  }
  
  let notation = '';
  
  // Piece type (except pawn)
  if (piece.type !== 'pawn') {
    notation += piece.type === 'knight' ? 'N' : piece.type[0].toUpperCase();
  }
  
  // Disambiguation if needed
  // TODO: Implement proper disambiguation
  
  // Capture
  if (capturedPiece) {
    if (piece.type === 'pawn') {
      notation += file;
    }
    notation += 'x';
  }
  
  // Destination
  notation += destFile + destRank;
  
  // Promotion
  if (isPromotion) {
    notation += '=Q'; // Always promoting to queen for simplicity
  }
  
  // Check/checkmate would be added later based on game state
  
  return notation;
};