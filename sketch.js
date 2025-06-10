let images = [];
let fragments = [];
let gridSize = 3; // 3x3 Kachelraster
let isLandscape = false;
let frozenStates = []; // Speichert, ob eine Kachel eingefroren ist

function preload() {
  images = [
    loadImage('LAYER_1.jpg', img => {}, err => {}),
    loadImage('LAYER_2.png', img => {}, err => {}),
    loadImage('LAYER_3.png', img => {}, err => {}),
    loadImage('LAYER_4.png', img => {}, err => {}),
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
  frozenStates = new Array(gridSize * gridSize).fill(false);
  let fragWidth = width / gridSize;
  let fragHeight = height / gridSize;
  const combinations = [
    [0, 1], // LAYER_1 + LAYER_2
    [2, 3], // LAYER_3 + LAYER_4
    [1, 4]  // LAYER_2 + Weißer Hintergrund
  ];
  for (let i = 0; i < gridSize * gridSize; i++) {
    let col = i % gridSize;
    let row = floor(i / gridSize);
    let x = col * fragWidth;
    let y = row * fragHeight;
    let comboIdx = floor(random(combinations.length));
    for (let layer = 0; layer < 5; layer++) {
      fragments.push({
        img: images[layer], x, y, width: fragWidth, height: fragHeight,
        sourceX: (col * (images[layer]?.width || width)) / gridSize,
        sourceY: (row * (images[layer]?.height || height)) / gridSize,
        sourceWidth: (images[layer]?.width || width) / gridSize,
        sourceHeight: (images[layer]?.height || height) / gridSize,
        visible: combinations[comboIdx].includes(layer),
        state: comboIdx, // Speichert die aktuelle Kombination (0, 1 oder 2)
        colorState: 0
      });
    }
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
    if (!frozenStates[i]) {
      // Nur aktualisieren, wenn nicht eingefroren
      let currentState = fragments[baseIndex].state;
      let nextState = (currentState + 1) % 3;
      let visibleLayers = [];
      for (let j = 0; j < 5; j++) {
        if (fragments[baseIndex + j].visible) visibleLayers.push(j);
      }
      let randomLayer = visibleLayers[floor(random(visibleLayers.length))];
      for (let j = 0; j < 5; j++) {
        fragments[baseIndex + j].state = nextState;
        fragments[baseIndex + j].visible = [0, 1, 2].includes(j) ? [0, 1].includes(nextState) : [2, 3].includes(nextState) ? [2, 3].includes(j) : [1, 4].includes(j);
        if (j === randomLayer && fragments[baseIndex + j].visible) {
          fragments[baseIndex + j].colorState = random(1) < 0.5 ? 1 : 2; // Zufällig rosa (1) oder gelb (2)
        } else {
          fragments[baseIndex + j].colorState = 0; // Weiß
        }
      }
    }
    for (let j = 0; j < 5; j++) {
      let frag = fragments[baseIndex + j];
      if (frag.visible) {
        let tintColor = frag.colorState === 1 ? 0xFF69B4CC : frag.colorState === 2 ? 0xFFFF00DC : 0xFFFFFF;
        tint(tintColor);
        if (frag.img) image(frag.img, x, y, width / gridSize, height / gridSize, frag.sourceX, frag.sourceY, frag.sourceWidth, frag.sourceHeight);
        else {
          fill(tintColor & 0xFFFFFF);
          rect(x, y, width / gridSize, height / gridSize);
        }
      }
    }
  }
  frameRate(15);
}

function mousePressed() {
  if (isLandscape) {
    let x = constrain(mouseX, 0, width - 1);
    let y = constrain(mouseY, 0, height - 1);
    let col = floor(x / (width / gridSize));
    let row = floor(y / (height / gridSize));
    if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
      let index = row * gridSize + col;
      frozenStates[index] = !frozenStates[index]; // Umschalten zwischen eingefroren und laufen
    }
  }
}

function preventDefault(e) { e.preventDefault(); }
document.addEventListener('touchmove', preventDefault, { passive: false });
