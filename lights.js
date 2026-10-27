const tileIds = ['IMG_8401','_MG_0724','_MG_0733','_MG_0743','_MG_0751','_MG_0752','_MG_0797','_MG_0803','_MG_0812','_MG_0820','_MG_0830','_MG_0847','_MG_0850','_MG_0854','_MG_0860','_MG_0886','_MG_0893','_MG_0900','_MG_0909','_MG_0915','_MG_0926','_MG_0933','_MG_0937','_MG_0940','_MG_0943'];
let tileState = Array(25).fill(false);
let tileButtons = [];

function setup() {
  noCanvas();
  if (document.body.dataset.page !== 'lights') return;
  tileButtons = [...document.querySelectorAll('.tile')];
  tileButtons.forEach((button, index) => button.addEventListener('click', () => flipTiles(index)));
  document.querySelector('#new-board').addEventListener('click', scrambleBoard);
  scrambleBoard();
}

function flipTiles(index) {
  toggleCross(index);
  drawTiles();
  const allOn = tileState.every(Boolean);
  const allOff = tileState.every(state => !state);
  if (allOn || allOff) window.location.href = 'about.html';
}

function toggleCross(index) {
  const row = floor(index / 5);
  const column = index % 5;
  [[row, column], [row - 1, column], [row + 1, column], [row, column - 1], [row, column + 1]].forEach(([r, c]) => {
    if (r >= 0 && r < 5 && c >= 0 && c < 5) tileState[r * 5 + c] = !tileState[r * 5 + c];
  });
}

function drawTiles() {
  tileButtons.forEach((button, index) => {
    const folder = tileState[index] ? 'cutouts compressed' : 'holes compressed';
    button.querySelector('img').src = `assets/${folder}/${tileIds[index]} Medium.png`;
  });
}

function scrambleBoard() {
  tileState = Array(25).fill(false);
  const moves = new Set();
  while (moves.size < 3) moves.add(floor(random(25)));
  moves.forEach(toggleCross);
  drawTiles();
}
