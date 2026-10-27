const imageNames = [
  '_MG_0926', '_MG_0701', '_MG_0710', '_MG_0714', '_MG_0724', 'IMG_8401',
  '_MG_0733', '_MG_0743', '_MG_0751', '_MG_0752', '_MG_0797', '_MG_0803',
  '_MG_0812', '_MG_0820', '_MG_0830', '_MG_0847', '_MG_0850', '_MG_0854',
  '_MG_0860', '_MG_0879', '_MG_0886', '_MG_0893', '_MG_0900', '_MG_0909',
  '_MG_0915', '_MG_0933', '_MG_0937', '_MG_0940', '_MG_0943', '_MG_0946'
];

const grid = document.querySelector('#image-grid');
const viewer = document.querySelector('#image-viewer');
const viewerImage = document.querySelector('#viewer-image');
const viewerNotes = document.querySelector('#viewer-notes');

for (const name of imageNames) {
  const path = `assets/full_images_compressed/${name}.png`;
  const button = document.createElement('button');
  const thumbnail = document.createElement('img');
  button.className = 'image-tile';
  button.type = 'button';
  button.setAttribute('aria-label', `view image ${name.toLowerCase()}`);
  thumbnail.src = path;
  thumbnail.alt = '';
  thumbnail.loading = 'lazy';
  thumbnail.decoding = 'async';
  button.append(thumbnail);
  button.addEventListener('click', () => {
    viewerImage.src = path;
    viewerImage.alt = name.toLowerCase();
    viewerNotes.textContent = 'description / date';
    viewer.showModal();
  });
  grid.append(button);
}

document.querySelector('#viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => {
  if (event.target === viewer) viewer.close();
});
