// Import PixiJS
const app = new PIXI.Application({ width: 800, height: 600 });
document.body.appendChild(app.view);

// Define slot symbols with multipliers and probabilities
const symbols = [
  { name: 'cherry', image: 'cherry.jpg', multiplier: 2 },
  { name: 'bell', image: 'bell.svg', multiplier: 5 },
  { name: 'cherry', image: 'cherry.jpg', multiplier: 2 },
  { name: 'bell', image: 'bell.svg', multiplier: 5 }
];

const symbolMultiplierMap = new Map();
symbols.forEach(symbol => {
  symbolMultiplierMap.set(symbol.name, symbol.multiplier);
});

const reels = [];
const numReels = 3;
const numRows = 3;
const reelWidth = 150;
let spinning = false;
let balance = 1000;
let stake = 10;
let autoSpins = 0;
let currentInterval; // Added to track active interval

// Display balance
const balanceText = new PIXI.Text(`Balance: $${balance}`, { fontSize: 24, fill: 'white' });
balanceText.x = 50;
balanceText.y = 20;
app.stage.addChild(balanceText);

// Stake input
const stakeText = new PIXI.Text(`Stake: $${stake}`, { fontSize: 24, fill: 'white' });
stakeText.x = 50;
stakeText.y = 50;
app.stage.addChild(stakeText);

const stakeInput = document.createElement("input");
stakeInput.type = "number";
stakeInput.value = stake;
stakeInput.style.position = "absolute";
stakeInput.style.top = "70px";
stakeInput.style.left = "150px";
stakeInput.style.width = "50px";
document.body.appendChild(stakeInput);

// Create reels
for (let i = 0; i < numReels; i++) {
  const reel = new PIXI.Container();
  reel.x = i * reelWidth + 200;
  reel.y = 100;
  reels.push(reel);
  app.stage.addChild(reel);
}

// Populate a single reel with symbols
function populateReel(reel) {
  reel.removeChildren();
  for (let j = 0; j < numRows; j++) {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    const symbol = symbols[randomIndex];
    const symbolTexture = PIXI.Texture.from(symbol.image);
    const symbolSprite = new PIXI.Sprite(symbolTexture);
    symbolSprite.y = j * 80;
    symbolSprite.width = 100;
    symbolSprite.height = 100;
    symbolSprite.symbolName = symbol.name;
    reel.addChild(symbolSprite);
  }
}

// Spin animation with sequential stopping
function spinAnimation(callback) {
  // Clear any existing interval before starting new one
  if (currentInterval) {
    clearInterval(currentInterval);
  }

  const spinCounts = [15, 20, 25]; // Left reel stops first, right last
  const remainingSpins = [...spinCounts]; // Copy to track remaining spins per reel

  currentInterval = setInterval(() => {
    reels.forEach((reel, index) => {
      if (remainingSpins[index] > 0) {
        populateReel(reel);
        remainingSpins[index]--;
      }
    });

    // Check if all reels have stopped
    if (remainingSpins.every(count => count <= 0)) {
      clearInterval(currentInterval);
      spinning = false;
      callback();
      currentInterval = null; // Reset interval reference
    }
  }, 100); // 100ms interval for smooth animation
}

// Spin function
function spin() {
  if (spinning || balance <= 0) return;
  stake = parseInt(stakeInput.value) || 0;
  if (stake <= 0 || stake > balance) {
    alert("Invalid stake amount!");
    return;
  }
  
  spinning = true;
  balance -= stake;
  balanceText.text = `Balance: $${balance}`;
  spinSound.play();
  spinAnimation(() => {
    checkWin();
    autoSpins--;
    if (autoSpins > 0) spin();
  });
}

// Check winning combinations
function checkWin() {
  const firstRow = reels.map(reel => reel.children[0].symbolName);
  
  if (new Set(firstRow).size === 1) {
    const winningSymbol = firstRow[0];
    const multiplier = symbolMultiplierMap.get(winningSymbol);
    
    winSound.play();
    const winnings = stake * multiplier;
    balance += winnings;
    balanceText.text = `Balance: $${balance}`;
    alert(`🎉 You won $${winnings}! ${winningSymbol}s pay x${multiplier}`);
  }
}

// Sound effects
const spinSound = new Audio('spin.mp3');
const winSound = new Audio('win.mp3');

// Spin button
const spinButton = new PIXI.Text('SPIN', { fontSize: 40, fill: 'white' });
spinButton.interactive = true;
spinButton.buttonMode = true;
spinButton.x = 350;
spinButton.y = 450;
spinButton.on('pointerdown', spin);
app.stage.addChild(spinButton);

// Autoplay overlay
const autoPlayOverlay = document.createElement("div");
autoPlayOverlay.style.position = "absolute";
autoPlayOverlay.style.top = "50px";
autoPlayOverlay.style.left = "50px";
autoPlayOverlay.style.width = "300px";
autoPlayOverlay.style.height = "250px";
autoPlayOverlay.style.background = "rgba(0, 0, 0, 0.8)";
autoPlayOverlay.style.display = "none";
autoPlayOverlay.style.padding = "20px";
autoPlayOverlay.style.textAlign = "center";
document.body.appendChild(autoPlayOverlay);

const autoPlayText = document.createElement("p");
autoPlayText.style.color = "white";
autoPlayText.innerText = "Select Auto Spins";
autoPlayOverlay.appendChild(autoPlayText);

let selectedAutoSpins = 0;
[5, 10, 25, 50, 100].forEach(spins => {
  const button = document.createElement("button");
  button.innerText = spins + " Spins";
  button.style.margin = "5px";
  button.onclick = () => {
    selectedAutoSpins = spins;
  };
  autoPlayOverlay.appendChild(button);
});

const startAutoPlayButton = document.createElement("button");
startAutoPlayButton.innerText = "Start AutoPlay";
startAutoPlayButton.style.marginTop = "10px";
startAutoPlayButton.onclick = () => {
  if (selectedAutoSpins > 0) {
    autoSpins = selectedAutoSpins;
    autoPlayOverlay.style.display = "none";
    spin();
  }
};
autoPlayOverlay.appendChild(startAutoPlayButton);

const closeButton = document.createElement("button");
closeButton.innerText = "Close";
closeButton.style.marginTop = "10px";
closeButton.onclick = () => autoPlayOverlay.style.display = "none";
autoPlayOverlay.appendChild(closeButton);

// Autoplay button
const autoPlayButton = new PIXI.Text('AUTOPLAY', { fontSize: 30, fill: 'white' });
autoPlayButton.interactive = true;
autoPlayButton.buttonMode = true;
autoPlayButton.x = 550;
autoPlayButton.y = 450;
autoPlayButton.on('pointerdown', () => autoPlayOverlay.style.display = "block");
app.stage.addChild(autoPlayButton);

// Initial setup
reels.forEach(reel => populateReel(reel));