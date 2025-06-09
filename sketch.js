let images = [];
let fragments = [];
let gridSize = 4; // 4x4 Kachelraster
let isLandscape = false;

function preload() {
  images = [
    loadImage('LAYER_1.jpg', img => console.log('Layer 0 loaded'), err => console.error('Layer 0 load error:', err)),
    loadImage('LAYER_2.png', img => console.log('Layer 1 loaded'), err => console.error('Layer 1 load error:', err)),
    loadImage('LAYER_3.png', img => console.log('Layer 2 loaded'), err => console.error('Layer 2 load error:', err)),
    loadImage('LAYER_4.png', img => console.log('Layer 3 loaded'), err => console.error('Layer 3 load error:', err)),
    null // Platzhalter für weißen Hintergrund
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  checkOrientation();
  if (images.every(img => img?.width || !img) && isLandscape) createFragments();
  else console.error('One or more images not loaded or device not in landscape mode. Check file names and orientation.');
  let fs = fullscreen();
  if (!fs) fullscreen(true);
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
        visible: false, state: floor(random(31)), colorState: 0
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
  for (let frag of fragments) {
    if (!frag.img && !frag.visible) continue;
    if (frag.visible) {
      push();
      if (frag.colorState === 1) tint(255, 105, 180, 220);
      else if (frag.colorState === 2) tint(255, 255, 0, 220);
      else tint(255, 255, 255);
      if (frag.img) {
        image(frag.img, frag.x, frag.y, frag.width, frag.height, frag.sourceX, frag.sourceY, frag.sourceWidth, frag.sourceHeight);
      } else {
        fill(255);
        noStroke();
        rect(frag.x, frag.y, frag.width, frag.height);
      }
      pop();
    }
  }
}

function touchStarted() {
  if (isLandscape) {
    for (let touch of touches) {
      handleInteraction(touch.x, touch.y);
    }
  }
}

function handleInteraction(x, y) {
  if (!isLandscape) return;
  for (let i = 0; i < fragments.length / 5; i++) {
    let baseIndex = i * 5;
    let frag = fragments[baseIndex];
    if (x >= frag.x && x <= frag.x + frag.width && y >= frag.y && y <= frag.y + frag.height) {
      let frags = fragments.slice(baseIndex, baseIndex + 5);
      let currentState = frags[0].state;
      let newState = (currentState + 1) % 31;
      frags[0].state = newState;

      let visibleCount = 0;
      frags[0].visible = (newState & 1) > 0; if (frags[0].visible) visibleCount++;
      frags[1].visible = (newState & 2) > 0; if (frags[1].visible) visibleCount++;
      frags[2].visible = (newState & 4) > 0; if (frags[2].visible) visibleCount++;
      frags[3].visible = (newState & 8) > 0; if (frags[3].visible) visibleCount++;
      frags[4].visible = (newState & 16) > 0; if (frags[4].visible) visibleCount++;

      if (visibleCount === 0) {
        let randIdx = floor(random(5));
        frags[randIdx].visible = true;
      }
      if (visibleCount < 3 && random() < 0.7) {
        let randIdx = floor(random(5));
        while (frags[randIdx].visible) randIdx = (randIdx + 1) % 5;
        frags[randIdx].visible = true;
      }

      for (let frag of frags) {
        if (random() < 0.5) frag.colorState = 0;
        else if (random() < 0.75) frag.colorState = 1;
        else frag.colorState = 2;
      }
      break;
    }
  }
}

function preventDefault(e) { e.preventDefault(); }
document.addEventListener('touchmove', preventDefault, { passive: false });
