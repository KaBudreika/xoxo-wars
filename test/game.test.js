import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRound, play } from '../game.js';

// Plays X on `xs` and O on filler cells in between. Returns the final round.
function playSequence(size, xs, os) {
  let r = newRound(size, 'X');
  for (let i = 0; i < xs.length; i++) {
    r = play(r, xs[i], 'X');
    assert.ok(r, `X move ${xs[i]} legal`);
    if (r.winner) return r;
    r = play(r, os[i], 'O');
    assert.ok(r, `O move ${os[i]} legal`);
  }
  return r;
}

const at = (size, row, col) => row * size + col;

test('horizontal five wins', () => {
  const n = 9;
  const r = playSequence(n, [0, 1, 2, 3, 4].map(c => at(n, 2, c)), [0, 1, 2, 3, 4].map(c => at(n, 5, c)));
  assert.equal(r.winner, 'X');
  assert.equal(r.line.length, 5);
});

test('vertical five wins', () => {
  const n = 6;
  const r = playSequence(n, [0, 1, 2, 3, 4].map(row => at(n, row, 5)), [0, 1, 2, 3, 4].map(row => at(n, row, 0)));
  assert.equal(r.winner, 'X');
});

test('diagonal five wins', () => {
  const n = 9;
  const r = playSequence(n, [0, 1, 2, 3, 4].map(i => at(n, i + 1, i + 2)), [0, 1, 2, 3, 4].map(i => at(n, 8, i)));
  assert.equal(r.winner, 'X');
});

test('anti-diagonal five wins, middle stone last', () => {
  const n = 12;
  const order = [0, 1, 3, 4, 2];
  const r = playSequence(n, order.map(i => at(n, i + 3, 10 - i)), [0, 1, 2, 3, 4].map(i => at(n, 0, i)));
  assert.equal(r.winner, 'X');
  assert.equal(r.line.length, 5);
});

test('four in a row does not win', () => {
  const n = 9;
  const r = playSequence(n, [0, 1, 2, 3].map(c => at(n, 0, c)), [0, 1, 2, 3].map(c => at(n, 4, c)));
  assert.equal(r.winner, null);
});

test('line does not wrap across rows', () => {
  const n = 6;
  // row 0 cols 3,4,5 and row 1 cols 0,1 are consecutive indexes 3..7
  const r = playSequence(n, [3, 4, 5, 6, 7], [30, 32, 34, 19, 21]);
  assert.equal(r.winner, null);
});

test('illegal moves are rejected', () => {
  let r = newRound(6, 'X');
  assert.equal(play(r, 0, 'O'), null, 'wrong turn');
  r = play(r, 0, 'X');
  assert.equal(play(r, 0, 'O'), null, 'occupied cell');
  assert.equal(play(r, 36, 'O'), null, 'off board');
});

test('full board without five is a draw', () => {
  const n = 6;
  // Pattern XXOO shifted by 2 per row: no five in any direction.
  const mark = (row, col) => ((col + 2 * row) % 4 < 2 ? 'X' : 'O');
  const xs = [], os = [];
  for (let i = 0; i < n * n; i++) (mark(Math.floor(i / n), i % n) === 'X' ? xs : os).push(i);
  assert.equal(xs.length, os.length);
  const r = playSequence(n, xs, os);
  assert.equal(r.winner, 'draw');
});
