let images = [];
let fragments = [];
let gridSize = 3; // 3x3 Kachelraster
let isLandscape = false;

function preload() {
  images = [
    loadImage('LAYER_1.jpg', img => {}, err => console.error('Layer 0 load error:', err)),
    loadImage('LAYER_2.png', img => {}, err => console.error('Layer 1 load error:', err)),
    loadImage('LAYER_3.png', img => {}, err => console.error('Layer 2 load error:', err)),
    loadImage('LAYER_4.png', img => {}, err => console.error('Layer 3 load error:', err)),
    null // Weißer Hintergrund
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  checkOrientation();
  if (images.every(img => img?.width || !img) && isLandscape) createFragments();
  else console.error('Images not loaded or not in landscape mode.');
  // fullscreen(true); // Für Browser-Test deaktiviert
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  checkOrientation();
  if (images.every(img => img?.width || !img) && isLandscape) createFragments();
}

function checkOrientation() {
  isLandscape = windowWidth > windowHeight;
  if (!isLandscape) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text('Bitte drehen Sie das Tablet ins Querformat!', width / 2, height / 2);
  }
}

function createFragments() {
  fragments = [];
  let fragWidth = width / gridSize;
  let fragHeight = height / gridSize;
  for (let i = 0; i < gridSize * gridSize; i++) {
    let col = i % gridSize;
    let row = floor(i / gridSize);
    let x = col * fragWidth;
    let y = row * fragHeight;
    for (let layer = 0; layer < 5; layer++) {
      fragments.push({
        img: images[layer], x, y, width: fragWidth, height: fragHeight,
        sourceX: (col * (images[layer]?.width || width)) / gridSize,
        sourceY: (row * (images[layer]?.height || height)) / gridSize,
        sourceWidth: (images[layer]?.width || width) / gridSize,
        sourceHeight: (images[layer]?.height || height) / gridSize,
        visible: false, state: floor(random(31)), colorState: (layer < 2 ? 0 : -1) // Nur Ebene 0 und 1 können Farben ändern
      });
    }
  }
  for (let i = 0; i < fragments.length; i += 5) {
    let randIdx = floor(random(5));
    fragments[i + randIdx].visible = true;
  }
}

function draw() {
  if (!isLandscape) {
    checkOrientation();
    return;
  }
  background(0);
  noStroke();
  for (let i = 0; i < gridSize * gridSize; i++) {
    let col = i % gridSize;
    let row = floor(i / gridSize);
    let x = col * (width / gridSize);
    let y = row * (height / gridSize);
    let baseIndex = i * 5;
    let visibleFrag = null;
    for (let j = 0; j < 5; j++) {
      if (fragments[baseIndex + j].visible) {
        visibleFrag = fragments[baseIndex + j];
        break;
      }
    }
    if (visibleFrag) {
      let tintColor = 0xFFFFFF; // Standardfarbe (weiß)
      if (visibleFrag.colorState >= 0) {
        tintColor = visibleFrag.colorState === 1 ? 0xFF69B4CC : visibleFrag.colorState === 2 ? 0xFFFF00DC : 0xFFFFFF;
      }
      tint(tintColor);
      if (visibleFrag.img) image(visibleFrag.img, x, y, width / gridSize, height / gridSize, visibleFrag.sourceX, visibleFrag.sourceY, visibleFrag.sourceWidth, visibleFrag.sourceHeight);
      else {
        fill(tintColor & 0xFFFFFF); // Nur RGB-Komponente für den weißen Hintergrund
        rect(x, y, width / gridSize, height / gridSize);
      }
    }
  }
  frameRate(15);
}

function mousePressed() {
  if (isLandscape) {
    // Begrenze Koordinaten auf Canvas-Größe
    let x = constrain(mouseX, 0, width - 1);
    let y = constrain(mouseY, 0, height - 1);
    handleInteraction(x, y);
  }
}

function handleInteraction(x, y) {
  if (!isLandscape) return;
  let col = floor(x / (width / gridSize));
  let row = floor(y / (height / gridSize));
  if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
    let index = row * gridSize + col;
    let baseIndex = index * 5;
    if (baseIndex >= 0 && baseIndex < fragments.length) {
      let frags = fragments.slice(baseIndex, baseIndex + 5);
      let newState = (frags[0].state + 1) % 31;
      frags[0].state = newState;

      frags[0].visible = (newState & 1) > 0;
      frags[1].visible = (newState & 2) > 0;
      frags[2].visible = (newState & 4) > 0;
      frags[3].visible = (newState & 8) > 0;
      frags[4].visible = (newState & 16) > 0;

      // Farbänderung nur für Ebene 0 und 1
      for (let i = 0; i < 2; i++) {
        if (frags[i].visible && frags[i].colorState >= 0) {
          frags[i].colorState = floor(random(3)); // 0 (weiß), 1 (rosa), 2 (gelb)
        }
      }
    }
  }
}

function preventDefault(e) { e.preventDefault(); }
document.addEventListener('touchmove', preventDefault, { passive: false });
