let images = [];
let fragments = [];
let gridSize = 3; // 3x3 Kachelraster

function preload() {
  images = [
    loadImage('LAYER_1.jpg', img => {}, err => {}),
    loadImage('LAYER_2.png', img => {}, err => {}),
    loadImage('LAYER_3.png', img => {}, err => {}),
    loadImage('LAYER_4.png', img => {}, err => {})
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  if (images.every(img => img?.width)) createFragments();
  else console.error('One or more images not loaded. Check file names and upload.');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (images.every(img => img?.width)) createFragments();
}

function createFragments() {
  fragments = [];
  let fragSize = min(width, height) / gridSize;
  for (let i = 0; i < gridSize * gridSize; i++) {
    let col = i % gridSize;
    let row = floor(i / gridSize);
    let x = col * fragSize;
    let y = row * fragSize;
    for (let layer = 0; layer < 4; layer++) {
      fragments.push({
        img: images[layer], x, y, width: fragSize, height: fragSize,
        sourceX: (col * images[layer].width) / gridSize,
        sourceY: (row * images[layer].height) / gridSize,
        sourceWidth: images[layer].width / gridSize,
        sourceHeight: images[layer].height / gridSize,
        visible: false, state: floor(random(15)), colorState: 0
      });
    }
  }
  for (let i = 0; i < fragments.length; i += 4) {
    let randIdx = floor(random(4));
    fragments[i + randIdx].visible = true;
  }
}

function draw() {
  background(0); // Standard-Hintergrund
  for (let frag of fragments) {
    if (!frag.img || !frag.sourceWidth || !frag.sourceHeight) continue;
    if (frag.visible) {
      push();
      // Farbe basierend auf colorState, Originalbild bleibt erkennbar
      if (frag.colorState === 1) tint(255, 105, 180, 220); // Leichtes Rosa
      else if (frag.colorState === 2) tint(255, 255, 0, 220); // Leichtes Gelb
      else tint(255, 255, 255); // Keine Färbung
      image(frag.img, frag.x, frag.y, frag.width, frag.height, frag.sourceX, frag.sourceY, frag.sourceWidth, frag.sourceHeight);
      pop();
    }
  }
}

function mousePressed() {
  handleInteraction(mouseX, mouseY);
}

function touchStarted() {
  for (let touch of touches) handleInteraction(touch.x, touch.y);
}

function handleInteraction(x, y) {
  for (let i = 0; i < fragments.length / 4; i++) {
    let baseIndex = i * 4;
    let isInTile = x >= fragments[baseIndex].x && x <= fragments[baseIndex].x + fragments[baseIndex].width &&
                   y >= fragments[baseIndex].y && y <= fragments[baseIndex].y + fragments[baseIndex].height;
    if (isInTile) {
      let frags = fragments.slice(baseIndex, baseIndex + 4);
      let currentState = frags[0].state;
      let newState = (currentState + 1) % 15; // 15 Zustände (0-14) für 4 Layer
      frags[0].state = newState;

      let visibleCount = 0;
      frags[0].visible = (newState & 1) > 0; if (frags[0].visible) visibleCount++;
      frags[1].visible = (newState & 2) > 0; if (frags[1].visible) visibleCount++;
      frags[2].visible = (newState & 4) > 0; if (frags[2].visible) visibleCount++;
      frags[3].visible = (newState & 8) > 0; if (frags[3].visible) visibleCount++;

      if (visibleCount === 0) {
        let randIdx = floor(random(4));
        frags[randIdx].visible = true;
      }
      if (visibleCount < 3 && random() < 0.7) {
        let randIdx = floor(random(4));
        while (frags[randIdx].visible) randIdx = (randIdx + 1) % 4;
        frags[randIdx].visible = true;
      }

      // Zufällige Farbänderung bei Interaktion
      for (let frag of frags) {
        if (random() < 0.5) frag.colorState = 0; // Keine Färbung
        else if (random() < 0.75) frag.colorState = 1; // Rosa
        else frag.colorState = 2; // Gelb
      }
    }
  }
}

function preventDefault(e) { e.preventDefault(); }
document.addEventListener('touchmove', preventDefault, { passive: false });
