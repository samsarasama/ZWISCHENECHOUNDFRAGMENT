let images = [];
let fragments = [];
let gridSize = 4; // 4x4 Kachelraster
let isLandscape = false;

function preload() {
  images = [
    loadImage('LAYER_1.jpg'),
    loadImage('LAYER_2.png'),
    loadImage('LAYER_3.png'),
    loadImage('LAYER_4.png'),
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  checkOrientation();
  if (images.every(img => img?.width)) createFragments();
  fullscreen(true); // Vollbildmodus direkt aktivieren
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  checkOrientation();
  if (images.every(img => img?.width)) createFragments();
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
  let fragSize = min(width, height) / gridSize;
  for (let i = 0; i < gridSize * gridSize; i++) {
    let col = i % gridSize;
    let row = floor(i / gridSize);
    let x = col * fragSize;
    let y = row * fragSize;
    for (let layer = 0; layer < 4; layer++) {
      fragments.push({
        img: images[layer], x, y, size: fragSize,
        sourceX: (col * images[layer].width) / gridSize,
        sourceY: (row * images[layer].height) / gridSize,
        sourceSize: images[layer].width / gridSize,
        visible: false, state: floor(random(15)), colorState: 0
      });
    }
  }
  for (let i = 0; i < fragments.length; i += 4) {
    fragments[i + floor(random(4))].visible = true;
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
      tint(frag.colorState === 1 ? [255, 105, 180, 220] : frag.colorState === 2 ? [255, 255, 0, 220] : [255, 255, 255]);
      image(frag.img, frag.x, frag.y, frag.size, frag.size, frag.sourceX, frag.sourceY, frag.sourceSize, frag.sourceSize);
      pop();
    }
  }
}

function touchStarted() {
  if (isLandscape) for (let touch of touches) handleInteraction(touch.x, touch.y);
}

function handleInteraction(x, y) {
    let now = millis();
  if (now - lastInteractionTime < 100) return;
  lastInteractionTime = now;
  
  for (let i = 0; i < fragments.length / 4; i++) {
    let base = i * 4;
    let frag = fragments[base];
    if (x >= frag.x && x <= frag.x + frag.size && y >= frag.y && y <= frag.y + frag.size) {
      let frags = fragments.slice(base, base + 4);
      let newState = (frags[0].state + 1) % 15;
      frags[0].state = newState;

      let visibleCount = 0;
      [frags[0].visible, frags[1].visible, frags[2].visible, frags[3].visible] = 
        [(newState & 1) > 0, (newState & 2) > 0, (newState & 4) > 0, (newState & 8) > 0];
      visibleCount = frags.filter(f => f.visible).length;

      if (visibleCount === 0) frags[floor(random(4))].visible = true;
      else if (visibleCount < 3 && random() < 0.7) {
        let idx = floor(random(4));
        while (frags[idx].visible) idx = (idx + 1) % 4;
        frags[idx].visible = true;
      }

      frags.forEach(frag => {
        frag.colorState = random() < 0.5 ? 0 : random() < 0.75 ? 1 : 2;
      });
      break;
    }
  }
}

function preventDefault(e) { e.preventDefault(); }
document.addEventListener('touchmove', preventDefault, { passive: false });
