import React, { useState, useEffect } from 'react';
import { Gamepad2, Puzzle, PlayCircle, X, Grid3X3 } from 'lucide-react';
import './Games.css';

const Games = () => {
  const [activeGame, setActiveGame] = useState(null);


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
      playable: true
    },
    {
      id: 'sudoku',
      title: 'Sudoku',
      icon: <Grid3X3 size={32} color="white" />,
      color: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      desc: 'Classic 9x9 number puzzle. Fill the grid!',
      playable: true
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
              ) : activeGame.id === 'memory' ? (
                <MemoryMatch />
              ) : activeGame.id === 'sudoku' ? (
                <Sudoku />
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

const MemoryMatch = () => {
  const emojis = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
    setCards(shuffledCards);
    setFlipped([]);
    setMatched(new Set());
    setIsLocked(false);
  };

  const handleCardClick = (index) => {
    if (isLocked || flipped.includes(index) || matched.has(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched(new Set([...matched, first, second]));
        setFlipped([]);
        setIsLocked(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const isSolved = matched.size === cards.length && cards.length > 0;

  return (
    <div className="memory-container tictactoe-container">
      <div className="tictactoe-status" style={{ minHeight: '27px' }}>
        {isSolved ? (
          <span className="winner-text">You found all pairs! 🎉</span>
        ) : (
          <span>Find the matching pairs</span>
        )}
      </div>

      <div className="memory-board">
        {cards.map((card, i) => (
          <button
            key={card.id}
            className={`memory-card ${flipped.includes(i) || matched.has(i) ? 'flipped' : ''}`}
            onClick={() => handleCardClick(i)}
          >
            <div className="memory-card-inner">
              <div className="memory-card-front">❓</div>
              <div className="memory-card-back">{card.emoji}</div>
            </div>
          </button>
        ))}
      </div>

      <button className="btn-reset-game" onClick={initGame}>
        Restart Game
      </button>
    </div>
  );
};

const Sudoku = () => {
  const INITIAL_BOARD = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ];

  const [board, setBoard] = useState([]);
  const [initialMask, setInitialMask] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [solution, setSolution] = useState([]);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const newBoard = JSON.parse(JSON.stringify(INITIAL_BOARD));
    // Randomize rows within 3x3 blocks
    for(let block=0; block<3; block++){
       const rows = [block*3, block*3+1, block*3+2].sort(() => Math.random() - 0.5);
       const temp1 = [...newBoard[block*3]];
       const temp2 = [...newBoard[block*3+1]];
       const temp3 = [...newBoard[block*3+2]];
       newBoard[rows[0]] = temp1;
       newBoard[rows[1]] = temp2;
       newBoard[rows[2]] = temp3;
    }
    
    setSolution(newBoard);

    const puzzle = newBoard.map(row => [...row]);
    const mask = Array(9).fill().map(() => Array(9).fill(false));
    
    let removed = 0;
    while(removed < 35) {
      let r = Math.floor(Math.random() * 9);
      let c = Math.floor(Math.random() * 9);
      if (puzzle[r][c] !== null) {
        puzzle[r][c] = null;
        mask[r][c] = true;
        removed++;
      }
    }
    
    setBoard(puzzle);
    setInitialMask(mask);
    setIsSolved(false);
    setSelectedCell(null);
  };

  const checkWin = (currentBoard) => {
    for(let r=0; r<9; r++){
      for(let c=0; c<9; c++){
        if(currentBoard[r][c] !== solution[r][c]) return;
      }
    }
    setIsSolved(true);
  };

  const handleCellClick = (r, c) => {
    if (initialMask[r][c] && !isSolved) {
      setSelectedCell([r, c]);
    }
  };

  const handleNumberInput = (num) => {
    if (selectedCell && !isSolved) {
      const [r, c] = selectedCell;
      const newBoard = [...board];
      newBoard[r] = [...newBoard[r]];
      newBoard[r][c] = num;
      setBoard(newBoard);
      checkWin(newBoard);
    }
  };

  return (
    <div className="sudoku-container tictactoe-container">
      <div className="tictactoe-status" style={{ minHeight: '27px' }}>
        {isSolved ? (
          <span className="winner-text">Sudoku Solved! 🎉</span>
        ) : (
          <span>Fill the numbers 1-9</span>
        )}
      </div>

      <div className="sudoku-board">
        {board.map((row, r) => (
          <div key={r} className="sudoku-row">
            {row.map((cell, c) => (
              <div 
                key={`${r}-${c}`}
                className={`sudoku-cell 
                  ${c === 2 || c === 5 ? 'border-right' : ''} 
                  ${r === 2 || r === 5 ? 'border-bottom' : ''}
                  ${selectedCell && selectedCell[0] === r && selectedCell[1] === c ? 'selected' : ''}
                  ${!initialMask[r][c] ? 'fixed' : 'editable'}
                `}
                onClick={() => handleCellClick(r, c)}
              >
                {cell || ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {!isSolved && (
        <div className="sudoku-keypad">
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button key={num} className="sudoku-key" onClick={() => handleNumberInput(num)}>
              {num}
            </button>
          ))}
          <button className="sudoku-key clear-key" onClick={() => handleNumberInput(null)}>X</button>
        </div>
      )}

      <button className="btn-reset-game" onClick={initGame} style={{marginTop: '16px'}}>
        New Game
      </button>
    </div>
  );
};

export default Games;
