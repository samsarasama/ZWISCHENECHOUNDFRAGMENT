let images = [];
let fragments = [];
let gridSize = 3; // 3x3 Kachelraster (angepasst für bessere Performance)
let isLandscape = false;

// Vordefinierte Abfolge von Kombinationen (2-4 Ebenen), unterschiedlich pro Kachel
const combinations = [
  [1, 2],        // LAYER_2 + LAYER_3
  [1, 2, 3],     // LAYER_2 + LAYER_3 + LAYER_4
  [0, 1, 2, 3],  // LAYER_1 + LAYER_2 + LAYER_3 + LAYER_4
  [2, 3, 4],     // LAYER_3 + LAYER_4 + Weiß
  [1, 3, 4]      // LAYER_2 + LAYER_3 + LAYER_4
];

function preload() {
  images = [
    loadImage('LAYER_1.jpg'),
    loadImage('LAYER_2.png'),
    loadImage('LAYER_3.png'),
    loadImage('LAYER_4.png'), 
    null // Weißer Hintergrund
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  checkOrientation();
  if (images.every(img => img?.width || !img) && isLandscape) createFragments();
  else console.error('Images not loaded or not in landscape mode.');
  fullscreen(true);
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
    // Zufälliger Startpunkt in der Abfolge pro Kachel
    let startCombo = floor(random(combinations.length));
    for (let layer = 0; layer < 5; layer++) {
      fragments.push({
        img: images[layer], x, y, width: fragWidth, height: fragHeight,
        sourceX: (col * (images[layer]?.width || width)) / gridSize,
        sourceY: (row * (images[layer]?.height || height)) / gridSize,
        sourceWidth: (images[layer]?.width || width) / gridSize,
        sourceHeight: (images[layer]?.height || height) / gridSize,
        visible: combinations[startCombo].includes(layer),
        state: startCombo, // Startzustand basiert auf Abfolge
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
  for (let frag of fragments) {
    if (frag.visible) {
      push();
      // Keine weiße Färbung, Hintergrund ist schwarz, daher nur rosa/gelb oder transparent
      if (frag.colorState === 1) tint(255, 105, 180, 220); // Leichtes Rosa
      else if (frag.colorState === 2) tint(255, 255, 0, 220); // Leichtes Gelb
      else tint(255, 255, 255, 100); // Leichte Transparenz statt Weiß
      if (frag.img) image(frag.img, frag.x, frag.y, frag.width, frag.height, frag.sourceX, frag.sourceY, frag.sourceWidth, frag.sourceHeight);
      else {
        noFill();
        noStroke();
      }
      pop();
    }
  }
  frameRate(30);
}

function mousePressed() {
  if (isLandscape) {
    handleInteraction(mouseX, mouseY);
    return false;
  }
}

function touchStarted() {
  if (isLandscape) {
    for (let touch of touches) handleInteraction(touch.x, touch.y);
    return false;
  }
}

function handleInteraction(x, y) {
  if (!isLandscape) return;
  let col = floor(x / (width / gridSize));
  let row = floor(y / (height / gridSize));
  let index = row * gridSize + col;
  let baseIndex = index * 5;

  if (baseIndex >= 0 && baseIndex < fragments.length) {
    let frags = fragments.slice(baseIndex, baseIndex + 5);
    let currentState = frags[0].state;
    let nextState = (currentState + 1) % combinations.length; // Zyklisch durch Abfolge
    frags[0].state = nextState;

    // Setze Sichtbarkeit basierend auf der aktuellen Kombination
    for (let layer = 0; layer < 5; layer++) {
      frags[layer].visible = combinations[nextState].includes(layer);
    }

    // Priorisiere obere Ebenen (1-4) mit höherer Wahrscheinlichkeit
    if (random() < 0.7 && frags.slice(1, 5).every(f => !f.visible)) {
      let upperIdx = floor(random(1, 5)); // Zufällige obere Ebene (1-4)
      frags[upperIdx].visible = true;
    }

    // Zufällige Farbänderung, seltener transparent
    for (let frag of frags) {
      if (frag.visible) {
        if (random() < 0.3) frag.colorState = 0; // 30% Transparenz
        else if (random() < 0.65) frag.colorState = 1; // 35% Rosa
        else frag.colorState = 2; // 35% Gelb
      }
    }
  }
}

function preventDefault(e) { e.preventDefault(); }
document.addEventListener('touchmove', preventDefault, { passive: false });
