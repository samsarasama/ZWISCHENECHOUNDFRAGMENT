let images = [];
let fragments = [];
let gridSize = 3;
let isLandscape = false;
let lastInteractionTime = 0;
const DEBUG = false;

function preload() {
  images = [
    loadImage('LAYER_1.jpg'),
    loadImage('LAYER_2.png'),
    loadImage('LAYER_3.png'),
    loadImage('LAYER_4.png'),
    null
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noSmooth();
  frameRate(30);
  checkOrientation();
  if (images.every(img => img?.width || !img) && isLandscape) {
    createFragments();
  }
  fullscreen(true);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  checkOrientation();
  if (images.every(img => img?.width || !img) && isLandscape) {
    createFragments();
  }
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
    if (frag.visible) {
      push();
      tint(frag.colorState === 1 ? [255, 105, 180, 220] :
           frag.colorState === 2 ? [255, 255, 0, 220] :
           [255, 255, 255]);
      if (frag.img) {
        image(frag.img, frag.x, frag.y, frag.width, frag.height,
              frag.sourceX, frag.sourceY, frag.sourceWidth, frag.sourceHeight);
      } else {
        fill(255);
        noStroke();
        rect(frag.x, frag.y, frag.width, frag.height);
      }
      pop();
    }
  }
}

function mousePressed() {
  if (isLandscape) {
    if (DEBUG) console.log('Mouse pressed at:', mouseX, mouseY);
    handleInteraction(mouseX, mouseY);
  }
}

function touchStarted() {
  if (isLandscape) {
    handleInteraction(touchX, touchY);
  }
  return false;
}

function handleInteraction(x, y) {
  let now = millis();
  if (now - lastInteractionTime < 100) return;
  lastInteractionTime = now;

  let col = floor(x / (width / gridSize));
  let row = floor(y / (height / gridSize));
  if (DEBUG) console.log('Calculated col, row:', col, row);
  if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
    let index = row * gridSize + col;
    let baseIndex = index * 5;
    if (DEBUG) console.log('Base index:', baseIndex);
    if (baseIndex >= 0 && baseIndex < fragments.length) {
      let frags = fragments.slice(baseIndex, baseIndex + 5);
      let currentState = frags[0].state;
      let newState = (currentState + 1) % 31;
      frags[0].state = newState;

      let visibleCount = 0;
      frags[0].visible = (newState & 1)
