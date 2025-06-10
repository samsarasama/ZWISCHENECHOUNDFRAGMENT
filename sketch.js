let images = [];
let fragments = [];
let gridSize = 3; // 3x3 Kachelraster
let isLandscape = true; // Feste Landschaftsorientierung, da Größe angepasst ist

// Vordefinierte Abfolge von Kombinationen (2-4 Ebenen)
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
  createCanvas(1920, 1200); // Feste Größe für Lenovo M10 (1920x1200)
  pixelDensity(1);
  noSmooth();
  let context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false; // Hardware-Beschleunigung
  createFragments();
  fullscreen(true);
}

function createFragments() {
  fragments = [];
  let fragWidth = 640; // 1920 / 3
  let fragHeight = 400; // 1200 / 3
  for (let i = 0; i < gridSize * gridSize; i++) {
    let col = i % gridSize;
    let row = floor(i / gridSize);
    let x = col * fragWidth;
    let y = row * fragHeight;
    let startCombo = floor(random(combinations.length));
    for (let layer = 0; layer < 5; layer++) {
      fragments.push({
        img: images[layer], x, y, width: fragWidth, height: fragHeight,
        sourceX: (col * (images[layer]?.width || 1920)) / gridSize,
        sourceY: (row * (images[layer]?.height || 1200)) / gridSize,
        sourceWidth: (images[layer]?.width || 1920) / gridSize,
        sourceHeight: (images[layer]?.height || 1200) / gridSize,
        visible: combinations[startCombo].includes(layer),
        state: startCombo,
        colorState: 0
      });
    }
  }
}

function draw() {
  background(0);
  for (let frag of fragments) {
    if (frag.visible && frag.img) {
      let tintColor = frag.colorState === 1 ? [255, 105, 180, 220] : frag.colorState === 2 ? [255, 255, 0, 220] : [255, 255, 255, 100];
      tint(...tintColor);
      image(frag.img, frag.x, frag.y, frag.width, frag.height, frag.sourceX, frag.sourceY, frag.sourceWidth, frag.sourceHeight);
    } else if (frag.visible && !frag.img) {
      noFill();
      noStroke();
    }
  }
  frameRate(15); // Reduzierte Frame-Rate
}

function mousePressed() {
  handleInteraction(mouseX, mouseY);
  return false;
}

function touchStarted() {
  for (let touch of touches) handleInteraction(touch.x, touch.y);
  return false;
}

function handleInteraction(x, y) {
  let col = floor(x / 640); // Feste Fragment-Breite
  let row = floor(y / 400); // Feste Fragment-Höhe
  let index = row * gridSize + col;
  let baseIndex = index * 5;

  if (baseIndex >= 0 && baseIndex < fragments.length) {
    let frags = fragments.slice(baseIndex, baseIndex + 5);
    let currentState = frags[0].state;
    let nextState = (currentState + 1) % combinations.length;
    frags[0].state = nextState;

    for (let layer = 0; layer < 5; layer++) {
      frags[layer].visible = combinations[nextState].includes(layer);
    }

    if (random() < 0.7 && frags.slice(1, 5).every(f => !f.visible)) {
      let upperIdx = floor(random(1, 5));
      frags[upperIdx].visible = true;
    }

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
