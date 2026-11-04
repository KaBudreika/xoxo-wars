// Pure game logic. No DOM, no network. Tested in test/game.test.js.

export const WIN_LENGTH = 5;
const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];

export function newRound(size, starter) {
  return {
    size,
    cells: Array(size * size).fill(null),
    turn: starter,
    starter,
    winner: null, // 'X' | 'O' | 'draw' | null
    line: [],
    moves: 0,
    startedAt: Date.now(),
    endedAt: null,
  };
}

// Returns the winning cell indexes through `index`, or [] if none.
export function findLine(cells, size, index) {
  const mark = cells[index];
  if (!mark) return [];
  const r0 = Math.floor(index / size);
  const c0 = index % size;
  for (const [dr, dc] of DIRECTIONS) {
    const line = [index];
    for (const sign of [1, -1]) {
      let r = r0 + dr * sign;
      let c = c0 + dc * sign;
      while (r >= 0 && r < size && c >= 0 && c < size && cells[r * size + c] === mark) {
        line.push(r * size + c);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= WIN_LENGTH) return line.sort((a, b) => a - b);
  }
  return [];
}

// Applies a move for `mark`. Returns the new round, or null if the move is illegal.
export function play(round, index, mark) {
  if (round.winner || round.turn !== mark) return null;
  if (index < 0 || index >= round.cells.length || round.cells[index]) return null;
  const cells = round.cells.slice();
  cells[index] = mark;
  const line = findLine(cells, round.size, index);
  const moves = round.moves + 1;
  let winner = null;
  if (line.length) winner = mark;
  else if (moves === cells.length) winner = 'draw';
  return {
    ...round,
    cells,
    moves,
    line,
    winner,
    turn: mark === 'X' ? 'O' : 'X',
    endedAt: winner ? Date.now() : null,
  };
}
