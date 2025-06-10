let images = [];
let fragments = [];
let gridSize = 4; // Feste 4x4 Kachelraster

function preload() {
  images = [
    loadImage('LAYER_1.jpg', img => {}, err => {}),
    loadImage('LAYER_2.png', img => {}, err => {}),
    loadImage('LAYER_3.png', img => {}, err => {}),
    loadImage('LAYER_4.png', img => {}, err => {})
  ];
}

function setup() {
  createCanvas(1920, 1200); // Feste Canvas-Größe für Lenovo M10 (1920x1200)
  createFragments();
}

function createFragments() {
  fragments = [];
  let fragSize = 480; // Feste Breite/Höhe pro Kachel (1920 / 4 bzw. 1200 / 4)
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
    if (frag.visible && frag.img && frag.sourceWidth && frag.sourceHeight) {
      let tintColor = frag.colorState === 1 ? 0xFF69B4CC : frag.colorState === 2 ? 0xFFFF00DC : 0xFFFFFF;
      tint(tintColor);
      image(frag.img, frag.x, frag.y, frag.width, frag.height, frag.sourceX, frag.sourceY, frag.sourceWidth, frag.sourceHeight);
    }
  }
  frameRate(15);
}

function touchStarted() {
  if (touches.length > 0) {
    for (let touch of touches) {
      let x = constrain(touch.x, 0, 1919);
      let y = constrain(touch.y, 0, 1199);
      let col = floor(x / 480);
      let row = floor(y / 300);
      if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
        let index = row * gridSize + col;
        let baseIndex = index * 4;
        let frags = fragments.slice(baseIndex, baseIndex + 4);
        let currentState = frags[0].state;
        let newState = (currentState + 1) % 15;
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

        for (let frag of frags) {
          if (random() < 0.5) frag.colorState = 0; // Keine Färbung
          else if (random() < 0.75) frag.colorState = 1; // Rosa
          else frag.colorState = 2; // Gelb
        }
      }
    }
    return false; // Verhindert Standard-Touch-Verhalten
  }
}

function preventDefault(e) { e.preventDefault(); }
document.addEventListener('touchmove', preventDefault, { passive: false });
