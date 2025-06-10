let images = [];
let fragments = [];
let gridSize = 3; // 3x3 Kachelraster
let isLandscape = true; // Feste Landschaftsorientierung

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
    loadImage('LAYER_1-min.jpg'),
    loadImage('LAYER_2-min.png'),
    loadImage('LAYER_3-min.png'),
    loadImage('LAYER_4-min.png'), 
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
  frameRate(15);
}

//function mousePressed() {
  //handleInteraction(mouseX, mouseY);
  //return false;
//}

function touchStarted() {
  for (let touch of touches) handleInteraction(touch.x, touch.y);
  return false;
}

function handleInteraction(x, y) {
  let col = floor(x / 640);
  let row = floor(y / 400);
  let index = row * gridSize + col;
  let baseIndex = index * 5;

  if (baseIndex >= 0 && baseIndex < fragments.length) {
    // Einzelne Fragmente direkt ansprechen
    let frag0 = fragments[baseIndex];
    let frag1 = fragments[baseIndex + 1];
    let frag2 = fragments[baseIndex + 2];
    let frag3 = fragments[baseIndex + 3];
    let frag4 = fragments[baseIndex + 4];
    
    let currentState = frag0.state;
    let nextState = (currentState + 1) % combinations.length;
    frag0.state = nextState;

    // Sichtbarkeit basierend auf Kombination setzen
    frag0.visible = combinations[nextState].includes(0);
    frag1.visible = combinations[nextState].includes(1);
    frag2.visible = combinations[nextState].includes(2);
    frag3.visible = combinations[nextState].includes(3);
    frag4.visible = combinations[nextState].includes(4);

    // Zufallswert einmal generieren
    let rand = random();
    if (rand < 0.7 && !frag1.visible && !frag2.visible && !frag3.visible && !frag4.visible) {
      let upperIdx = floor(random(1, 5));
      [frag1, frag2, frag3, frag4][upperIdx - 1].visible = true;
    }

    // Seltene Farbänderung pro Ebene (20% Chance)
    let colorRand = random();
    if (frag0.visible && colorRand < 0.2) frag0.colorState = colorRand < 0.1 ? 1 : 2; // 10% Rosa, 10% Gelb
    if (frag1.visible && colorRand < 0.2) frag1.colorState = colorRand < 0.1 ? 1 : 2;
    if (frag2.visible && colorRand < 0.2) frag2.colorState = colorRand < 0.1 ? 1 : 2;
    if (frag3.visible && colorRand < 0.2) frag3.colorState = colorRand < 0.1 ? 1 : 2;
    if (frag4.visible && colorRand < 0.2) frag4.colorState = colorRand < 0.1 ? 1 : 2;
  }
}

function preventDefault(e) { e.preventDefault(); }
document.addEventListener('touchmove', preventDefault, { passive: false });
