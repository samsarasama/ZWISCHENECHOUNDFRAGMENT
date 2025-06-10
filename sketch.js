let images = [];
let fragments = [];
let gridSize = 2; // 2x2 Kachelraster
let isLandscape = false;

function preload() {
  images = [
    loadImage('LAYER_1.jpg', img => console.log('Layer 0 loaded'), err => console.error('Layer 0 load error:', err)),
    loadImage('LAYER_2.png', img => console.log('Layer 1 loaded'), err => console.error('Layer 1 load error:', err)),
    null // 2 Bilder + weißer Hintergrund
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  checkOrientation();
  if (images.every(img => img?.width || !img) && isLandscape) createFragments();
  else console.error('Images not loaded or not in landscape mode.');
  // fullscreen(true); // Für Browser-Test deaktiviert, da es Koordinatenprobleme verursachen kann
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
    for (let layer = 0; layer < 3; layer++) {
      fragments.push({
        img: images[layer], x, y, width: fragWidth, height: fragHeight,
        sourceX: (col * (images[layer]?.width || width)) / gridSize,
        sourceY: (row * (images[layer]?.height || height)) / gridSize,
        sourceWidth: (images[layer]?.width || width) / gridSize,
        sourceHeight: (images[layer]?.height || height) / gridSize,
        visible: false, state: floor(random(7)), colorState: 0
      });
    }
  }
  for (let i = 0; i < fragments.length; i += 3) {
    let randIdx = floor(random(3));
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
    let baseIndex = i * 3;
    let visibleFrag = null;
    for (let j = 0; j < 3; j++) {
      if (fragments[baseIndex + j].visible) {
        visibleFrag = fragments[baseIndex + j];
        break;
      }
    }
    if (visibleFrag) {
      tint(visibleFrag.colorState === 1 ? 0xFF69B4CC : visibleFrag.colorState === 2 ? 0xFFFF00DC : 0xFFFFFF);
      if (visibleFrag.img) image(visibleFrag.img, x, y, width / gridSize, height / gridSize, visibleFrag.sourceX, visibleFrag.sourceY, visibleFrag.sourceWidth, visibleFrag.sourceHeight);
      else {
        fill(visibleFrag.colorState === 1 ? 0xFF69B4 : visibleFrag.colorState === 2 ? 0xFFFF00 : 0xFFFFFF);
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
    console.log('Mouse pressed at:', x, y, 'Canvas size:', width, height);
    handleInteraction(x, y);
  } else {
    console.log('Not in landscape mode');
  }
}

function handleInteraction(x, y) {
  if (!isLandscape) return;
  let col = floor(x / (width / gridSize));
  let row = floor(y / (height / gridSize));
  console.log('Calculated col, row:', col, row, 'Grid size:', gridSize);
  if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
    let index = row * gridSize + col;
    let baseIndex = index * 3;
    console.log('Base index:', baseIndex);
    if (baseIndex >= 0 && baseIndex < fragments.length) {
      let frags = fragments.slice(baseIndex, baseIndex + 3);
      let newState = (frags[0].state + 1) % 7;
      frags[0].state = newState;

      frags[0].visible = (newState & 1) > 0;
      frags[1].visible = (newState & 2) > 0;
      frags[2].visible = (newState & 4) > 0;

      for (let frag of frags) frag.colorState = floor(random(3));
    } else {
      console.log('Base index out of bounds');
    }
  } else {
    console.log('Click outside grid');
  }
}

function preventDefault(e) { e.preventDefault(); }
document.addEventListener('touchmove', preventDefault, { passive: false });
