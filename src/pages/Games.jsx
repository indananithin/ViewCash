import React, { useState, useEffect } from 'react';
import { Gamepad2, Puzzle, PlayCircle, X } from 'lucide-react';
import './Games.css';

const Games = () => {
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    // Disable pull-to-refresh on this page to prevent game state loss
    document.body.style.overscrollBehaviorY = 'contain';
    return () => {
      document.body.style.overscrollBehaviorY = 'auto';
    };
  }, []);

  const gamesList = [
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe',
      icon: <PlayCircle size={32} color="white" />,
      color: 'var(--action-gradient)',
      desc: 'Classic 3x3 grid game. Play against a friend!',
      playable: true
    },
    {
      id: 'slidepuzzle',
      title: 'Number Slide Puzzle',
      icon: <Puzzle size={32} color="white" />,
      color: 'var(--success-gradient)',
      desc: 'Slide the tiles to order them from 1 to 8.',
      playable: true
    },
    {
      id: 'memory',
      title: 'Memory Match',
      icon: <Gamepad2 size={32} color="white" />,
      color: 'var(--accent-gradient)',
      desc: 'Flip cards and find the matching pairs.',
      playable: false
    }
  ];

  return (
    <div className="games-container page-container">
      <header className="page-header">
        <h2><Gamepad2 size={24} color="var(--primary-orange)" style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Play Zone</h2>
        <p>Play fun games to relax. No coins required!</p>
      </header>

      <div className="games-grid">
        {gamesList.map((game) => (
          <div key={game.id} className="game-card">
            <div className="game-icon" style={{ background: game.color }}>
              {game.icon}
            </div>
            <div className="game-info">
              <h3>{game.title}</h3>
              <p>{game.desc}</p>
            </div>
            <button 
              className="btn-play"
              onClick={() => setActiveGame(game)}
            >
              Play Now
            </button>
          </div>
        ))}
      </div>

      {activeGame && (
        <div className="game-modal-overlay">
          <div className="game-modal-content">
            <button className="btn-close-game" onClick={() => setActiveGame(null)}>
              <X size={24} />
            </button>
            
            <div className="game-modal-header">
              <h2>{activeGame.title}</h2>
              <p>Just for fun!</p>
            </div>

            <div className="game-area">
              {activeGame.id === 'tictactoe' ? (
                <TicTacToe />
              ) : activeGame.id === 'slidepuzzle' ? (
                <SlidePuzzle />
              ) : (
                <div className="game-coming-soon">
                  <Gamepad2 size={48} color="var(--text-light)" />
                  <h3>Game in Development</h3>
                  <p>We are actively working on bringing {activeGame.title} to life. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  
  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = checkWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  const handleClick = (i) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="tictactoe-container">
      <div className="tictactoe-status">
        {winner ? (
          <span className="winner-text">Winner: {winner}! 🎉</span>
        ) : isDraw ? (
          <span className="draw-text">It's a Draw!</span>
        ) : (
          <span>Next Player: <strong style={{color: isXNext ? 'var(--primary-orange)' : 'var(--accent-purple)'}}>{isXNext ? 'X' : 'O'}</strong></span>
        )}
      </div>

      <div className="tictactoe-board">
        {board.map((cell, idx) => (
          <button 
            key={idx} 
            className={`tictactoe-cell ${cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : ''}`}
            onClick={() => handleClick(idx)}
          >
            {cell}
          </button>
        ))}
      </div>

      <button className="btn-reset-game" onClick={resetGame}>
        Restart Game
      </button>
    </div>
  );
};

const SlidePuzzle = () => {
  const [board, setBoard] = useState([1, 2, 3, 4, 5, 6, 7, 8, null]);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    shuffleBoard();
  }, []);

  const shuffleBoard = () => {
    let newBoard = [1, 2, 3, 4, 5, 6, 7, 8, null];
    let emptyIdx = 8;
    for (let i = 0; i < 150; i++) {
      const validMoves = [];
      const row = Math.floor(emptyIdx / 3);
      const col = emptyIdx % 3;
      if (row > 0) validMoves.push(emptyIdx - 3); // Up
      if (row < 2) validMoves.push(emptyIdx + 3); // Down
      if (col > 0) validMoves.push(emptyIdx - 1); // Left
      if (col < 2) validMoves.push(emptyIdx + 1); // Right
      
      const move = validMoves[Math.floor(Math.random() * validMoves.length)];
      newBoard[emptyIdx] = newBoard[move];
      newBoard[move] = null;
      emptyIdx = move;
    }
    setBoard([...newBoard]); // spread to trigger re-render
    setIsSolved(false);
  };

  const handleClick = (index) => {
    const emptyIndex = board.indexOf(null);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    // Check if adjacent (not diagonal)
    if (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1) {
      const newBoard = [...board];
      newBoard[emptyIndex] = newBoard[index];
      newBoard[index] = null;
      setBoard(newBoard);
      checkWin(newBoard);
    }
  };

  const checkWin = (currentBoard) => {
    for (let i = 0; i < 8; i++) {
      if (currentBoard[i] !== i + 1) return;
    }
    setIsSolved(true);
  };

  return (
    <div className="tictactoe-container">
      <div className="tictactoe-status" style={{ minHeight: '27px' }}>
        {isSolved ? (
          <span className="winner-text">You solved it! 🎉</span>
        ) : (
          <span>Tap tiles to slide</span>
        )}
      </div>

      <div className="slide-puzzle-board">
        {board.map((num, i) => (
          <button
            key={i}
            className={`slide-puzzle-cell ${num === null ? 'empty-cell' : ''}`}
            onClick={() => handleClick(i)}
            disabled={isSolved || num === null}
          >
            {num}
          </button>
        ))}
      </div>

      <button className="btn-reset-game" onClick={shuffleBoard}>
        Restart Puzzle
      </button>
    </div>
  );
};

export default Games;
