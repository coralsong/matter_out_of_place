const requestedGame = new URLSearchParams(window.location.search).get('game');
document.body.dataset.page = ['placement', 'mosaic', 'lights'].includes(requestedGame) ? requestedGame : 'placement';
const placementRunKey = 'placement-run-v1';

if (requestedGame === 'placement' && new URLSearchParams(window.location.search).has('new')) {
  sessionStorage.removeItem(placementRunKey);
}

const imageIds = ['IMG_8401','_MG_0724','_MG_0733','_MG_0743','_MG_0751','_MG_0752','_MG_0797','_MG_0803','_MG_0812','_MG_0820','_MG_0830','_MG_0847','_MG_0850','_MG_0854','_MG_0860','_MG_0886','_MG_0893','_MG_0900','_MG_0909','_MG_0915','_MG_0926','_MG_0933','_MG_0937','_MG_0940','_MG_0943','_MG_0946'];
const cutoutPath = id => `assets/cutouts%20compressed/${id}%20Medium.png`;
const compressedCutoutPath = id => `assets/cutouts%20compressed/${id}%20Medium.png`;
const fullImagePath = id => `assets/full_images_compressed/${id}.png`;
const holePath = id => `assets/holes%20compressed/${id}%20Medium.png`;

function setupPlacement() {
  const stage = document.querySelector('#place-stage');
  const piece = document.querySelector('#piece-image');
  const pieceWrap = piece.parentElement;
  const target = document.querySelector('#target-image');
  const score = document.querySelector('#score');
  const placementGame = document.querySelector('.placement-game');
  const results = document.querySelector('#placement-results');
  const averageScore = document.querySelector('#average-score');
  let savedRun;
  try {
    savedRun = JSON.parse(sessionStorage.getItem(placementRunKey) || 'null');
  } catch {
    savedRun = null;
  }
  let index = savedRun?.index ?? 0;
  let dragStart = null;
  let locked = false;
  const scores = savedRun?.scores ?? [];

  function saveRun() {
    sessionStorage.setItem(placementRunKey, JSON.stringify({ index, scores }));
  }

  function showResults() {
    const average = scores.reduce((total, value) => total + value, 0) / scores.length;
    averageScore.textContent = `${average.toFixed(2)}%`;
    placementGame.hidden = true;
    results.hidden = false;
  }

  function loadPair() {
    if (index >= imageIds.length) {
      showResults();
      return;
    }
    const id = imageIds[index];
    target.src = holePath(id);
    piece.src = cutoutPath(id);
    pieceWrap.style.left = '50%';
    pieceWrap.style.top = '10%';
    score.textContent = '';
    locked = false;
    saveRun();
  }

  function updateScore() {
    const targetBounds = target.getBoundingClientRect();
    const pieceBounds = piece.getBoundingClientRect();
    const distance = Math.hypot(
      targetBounds.left + targetBounds.width / 2 - pieceBounds.left - pieceBounds.width / 2,
      targetBounds.top + targetBounds.height / 2 - pieceBounds.top - pieceBounds.height / 2
    );
    const sensitivityRange = targetBounds.width * 0.25;
    const accuracy = Math.max(0, 100 * (1 - distance / sensitivityRange));
    score.textContent = `${accuracy.toFixed(2)}%`;
    return accuracy;
  }

  piece.addEventListener('pointerdown', event => {
    if (locked) return;
    event.preventDefault();
    const stageBounds = stage.getBoundingClientRect();
    const pieceBounds = pieceWrap.getBoundingClientRect();
    dragStart = {
      grabX: event.clientX - pieceBounds.left,
      grabY: event.clientY - pieceBounds.top,
      stageLeft: stageBounds.left,
      stageTop: stageBounds.top,
    };
    piece.setPointerCapture(event.pointerId);
  });
  piece.addEventListener('pointermove', event => {
    if (!dragStart) return;
    const x = event.clientX - dragStart.stageLeft - dragStart.grabX;
    const y = event.clientY - dragStart.stageTop - dragStart.grabY;
    pieceWrap.style.left = `${x}px`;
    pieceWrap.style.top = `${y}px`;
  });
  function release() {
    if (!dragStart || locked) return;
    dragStart = null;
    locked = true;
    scores.push(updateScore());
    index++;
    saveRun();
    window.setTimeout(() => {
      if (index < imageIds.length) {
        loadPair();
        return;
      }
      showResults();
    }, 2500);
  }
  piece.addEventListener('pointerup', release);
  piece.addEventListener('pointercancel', release);
  document.querySelector('#skip-to-last').addEventListener('click', () => {
    if (locked || index >= imageIds.length - 1) return;
    index = imageIds.length - 1;
    loadPair();
  });
  loadPair();
}

function setupMosaic() {
  const image = document.querySelector('#mosaic-image');
  const frame = document.querySelector('#mosaic-frame');
  const lens = document.querySelector('#lens');
  const input = document.querySelector('#guess-input');
  let index = Math.floor(Math.random() * imageIds.length);
  function loadNext() {
    index = (index + 1) % imageIds.length;
    frame.classList.remove('is-revealed');
    image.src = fullImagePath(imageIds[index]);
    image.style.filter = 'blur(8px)';
    lens.style.backgroundImage = `url("${fullImagePath(imageIds[index])}")`;
    input.value = '';
  }
  function revealImage() {
    image.src = fullImagePath(imageIds[index]);
    image.style.filter = 'none';
    frame.classList.add('is-revealed');
    lens.style.display = 'none';
  }
  function showLens(event) {
    const bounds = frame.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    lens.style.left = `${x}px`;
    lens.style.top = `${y}px`;
    //the 2.5 is what adjusts zoom level of zoom lens
    const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight) * 0.8;
    const renderedWidth = image.naturalWidth * scale;
    const renderedHeight = image.naturalHeight * scale;
    const cropX = (renderedWidth - bounds.width) / 2;
    const cropY = (renderedHeight - bounds.height) / 2;
    lens.style.backgroundSize = `${renderedWidth * 2}px ${renderedHeight * 2}px`;
    lens.style.backgroundPosition = `${lens.offsetWidth / 2 - (x + cropX) * 2}px ${lens.offsetHeight / 2 - (y + cropY) * 2}px`;
  }
  frame.addEventListener('pointerenter', event => { lens.style.display = 'block'; showLens(event); });
  frame.addEventListener('pointermove', showLens);
  frame.addEventListener('pointerleave', () => { lens.style.display = 'none'; });
  document.querySelector('#guess-form').addEventListener('submit', event => { event.preventDefault(); revealImage(); });
  document.querySelector('#another-image').addEventListener('click', loadNext);
  loadNext();
}

if (document.body.dataset.page === 'placement') setupPlacement();
if (document.body.dataset.page === 'mosaic') setupMosaic();
