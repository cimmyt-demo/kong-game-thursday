// Create reels
function createReels() {
    // Clear existing reels
    reels.forEach(reel => {
        app.stage.removeChild(reel);
    });
    reels.length = 0;
    reelSymbols.length = 0;
    
    const { reelWidth, reelHeight } = calculateReelDimensions();
    
    // Create new reels
    for (let i = 0; i < numReels; i++) {
        // Create reel container
        const reel = new PIXI.Container();
        reel.x = (app.screen.width / numReels) * i + (app.screen.width / numReels - reelWidth) / 2;
        reel.y = (app.screen.height - reelHeight) / 2;
        
        // Add background image to each reel
        // const reelBackground = new PIXI.Sprite(reelBackgroundTexture);
        // reelBackground.width = reelWidth;
        // reelBackground.height = reelHeight;
        // reelBackground.alpha = 0.8; // Adjust transparency as needed
        // reel.addChild(reelBackground);
        
        // Create symbol container
        const symbolContainer = new PIXI.Container();
        reel.addChild(symbolContainer);
        
        reels.push(reel);
        reelSymbols.push(symbolContainer);
        app.stage.addChild(reel);
    }
    
    // Populate reels
    populateReels();
}

// Populate all reels with symbols
function populateReels() {
    for (let i = 0; i < numReels; i++) {
        populateReel(i);
    }
}


// Enhanced function to highlight winning symbols with different effects based on symbol type
function highlightWinningSymbols(apiReels) {
    // Find winning combinations
    const winningPositions = findWinningCombinations(apiReels);
    
    // Apply highlight effect to winning symbols
    for (let i = 0; i < numReels; i++) {
        const symbolContainer = reelSymbols[i];
        
        for (let j = 0; j < symbolContainer.children.length; j++) {
            const sprite = symbolContainer.children[j];
            
            // Check if this position is in the winning positions
            const winPosition = winningPositions.find(pos => pos.reel === i && pos.row === j);
            
            if (winPosition) {
                // Remove any existing filters
                sprite.filters = [];
                
                // Remove any existing animation classes
                sprite.scale.set(1);
                
                // Add a glow filter based on symbol type
                let glowColor;
                let glowIntensity = 15;
                
                // Determine the appropriate animation class based on symbol type
                let animationClass;
                
                switch (sprite.symbolName) {
                    case "Treasure Chest":
                        glowColor = 0xFFD700; // Gold
                        animationClass = "winning-symbol-treasure-chest";
                        break;
                    case "Wild":
                        glowColor = 0xFF0000; // Red
                        animationClass = "winning-symbol-wild";
                        glowIntensity = 20;
                        break;
                    case "Scatter":
                        glowColor = 0xFFFFFF; // White
                        animationClass = "winning-symbol-scatter";
                        glowIntensity = 18;
                        break;
                    case "Explorer":
                        glowColor = 0x8B4513; // Brown
                        animationClass = "winning-symbol-explorer";
                        break;
                    case "Compass":
                        glowColor = 0x4682B4; // Steel Blue
                        animationClass = "winning-symbol-compass";
                        break;
                    case "Binoculars":
                        glowColor = 0x008000; // Green
                        animationClass = "winning-symbol-binoculars";
                        break;
                    case "A":
                    case "K":
                    case "Q":
                    case "J":
                        glowColor = 0xFFD700; // Gold (lighter)
                        animationClass = "winning-symbol-card";
                        glowIntensity = 10;
                        break;
                    default:
                        glowColor = 0xFFD700; // Default gold
                        animationClass = "winning-symbol";
                }
                
                // Apply glow filter
                sprite.filters = [new PIXI.filters.GlowFilter(glowIntensity, 2, 1, glowColor, 0.5)];
                
                // Store original position and scale for animation
                const originalX = sprite.x;
                const originalY = sprite.y;
                const originalScale = { x: sprite.scale.x, y: sprite.scale.y };
                
                // Create custom animation based on symbol type
                let animationTicker;
                
                switch (animationClass) {
                    case "winning-symbol-treasure-chest":
                        // Treasure chest animation: pulsing gold glow with slight rotation
                        let treasureAngle = -2;
                        let treasureDirection = 1;
                        
                        animationTicker = (delta) => {
                            // Rotate slightly back and forth
                            treasureAngle += 0.1 * treasureDirection * delta;
                            if (treasureAngle > 2) treasureDirection = -1;
                            if (treasureAngle < -2) treasureDirection = 1;
                            
                            sprite.angle = treasureAngle;
                            
                            // Pulse scale
                            const scale = 1 + 0.08 * Math.sin(Date.now() / 200);
                            sprite.scale.set(scale * originalScale.x, scale * originalScale.y);
                        };
                        break;
                        
                    case "winning-symbol-wild":
                        // Wild animation: rainbow color cycling and pulsing
                        let wildColorPhase = 0;
                        
                        animationTicker = (delta) => {
                            wildColorPhase += 0.02 * delta;
                            
                            // Cycle through rainbow colors
                            const r = Math.sin(wildColorPhase) * 127 + 128;
                            const g = Math.sin(wildColorPhase + 2) * 127 + 128;
                            const b = Math.sin(wildColorPhase + 4) * 127 + 128;
                            
                            const colorHex = (Math.floor(r) << 16) + (Math.floor(g) << 8) + Math.floor(b);
                            
                            // Update glow filter color
                            if (sprite.filters && sprite.filters[0]) {
                                sprite.filters[0].color = colorHex;
                            }
                            
                            // Pulse scale
                            const scale = 1 + 0.1 * Math.sin(Date.now() / 150);
                            sprite.scale.set(scale * originalScale.x, scale * originalScale.y);
                        };
                        break;
                        
                    case "winning-symbol-scatter":
                        // Scatter animation: bright flashing and larger pulsing
                        animationTicker = (delta) => {
                            // Pulse scale with larger amplitude
                            const scale = 1 + 0.15 * Math.sin(Date.now() / 250);
                            sprite.scale.set(scale * originalScale.x, scale * originalScale.y);
                            
                            // Pulse brightness
                            const brightness = 1 + 0.5 * Math.sin(Date.now() / 200);
                            sprite.filters[0].outerStrength = brightness * 2;
                        };
                        break;
                        
                    case "winning-symbol-explorer":
                        // Explorer animation: bounce up and down
                        animationTicker = (delta) => {
                            // Bounce effect
                            const offset = Math.sin(Date.now() / 200) * 3;
                            sprite.y = originalY + offset;
                            
                            // Subtle scale pulse
                            const scale = 1 + 0.07 * Math.sin(Date.now() / 200);
                            sprite.scale.set(scale * originalScale.x, scale * originalScale.y);
                        };
                        break;
                        
                    case "winning-symbol-compass":
                        // Compass animation: rotation
                        let compassAngle = 0;
                        
                        animationTicker = (delta) => {
                            // Rotate back and forth
                            compassAngle = 15 * Math.sin(Date.now() / 300);
                            sprite.angle = compassAngle;
                            
                            // Subtle scale pulse
                            const scale = 1 + 0.05 * Math.sin(Date.now() / 250);
                            sprite.scale.set(scale * originalScale.x, scale * originalScale.y);
                        };
                        break;
                        
                    case "winning-symbol-binoculars":
                        // Binoculars animation: side to side movement
                        animationTicker = (delta) => {
                            // Side to side movement
                            const offset = Math.sin(Date.now() / 200) * 3;
                            sprite.x = originalX + offset;
                            
                            // Subtle scale pulse
                            const scale = 1 + 0.05 * Math.sin(Date.now() / 220);
                            sprite.scale.set(scale * originalScale.x, scale * originalScale.y);
                        };
                        break;
                        
                    case "winning-symbol-card":
                        // Card symbols animation: subtle pulse
                        animationTicker = (delta) => {
                            // Simple scale pulse
                            const scale = 1 + 0.04 * Math.sin(Date.now() / 180);
                            sprite.scale.set(scale * originalScale.x, scale * originalScale.y);
                        };
                        break;
                        
                    default:
                        // Default animation: simple pulse
                        animationTicker = (delta) => {
                            const scale = 1 + 0.05 * Math.sin(Date.now() / 200);
                            sprite.scale.set(scale * originalScale.x, scale * originalScale.y);
                        };
                }
                
                // Add the animation to the ticker
                const tickerId = app.ticker.add(animationTicker);
                
                // Store the ticker ID on the sprite for later removal
                sprite.tickerId = tickerId;
                
                // Stop the animation after 3 seconds
                setTimeout(() => {
                    if (app.ticker && sprite.tickerId) {
                        app.ticker.remove(sprite.tickerId);
                    }
                    
                    // Reset sprite properties
                    sprite.filters = null;
                    sprite.scale.set(originalScale.x, originalScale.y);
                    sprite.angle = 0;
                    sprite.x = originalX;
                    sprite.y = originalY;
                    
                    delete sprite.tickerId;
                }, 3000);
            }
        }
    }
}


// Function to play spin sound
function playSpinSound() {
    if (soundEffectsEnabled && spinSound) {
        spinSound.play().catch(e => console.log("Audio play failed:", e));
    }
}

// Function to play win sound
function playWinSound() {
    if (soundEffectsEnabled && winSound) {
        winSound.play().catch(e => console.log("Audio play failed:", e));
    }
}

function updateWinnings(targetAmount) {
    let element = document.getElementById('update_winnings');
    let currentAmount = parseFloat(element.innerHTML) || 0;
    let increment = (targetAmount - currentAmount) / 50; // Adjust speed

    let counter = setInterval(() => {
        currentAmount += increment;
        element.innerHTML = `${currentAmount.toFixed(2)}`;

        if ((increment > 0 && currentAmount >= targetAmount) || (increment < 0 && currentAmount <= targetAmount)) {
            element.innerHTML = `${targetAmount.toFixed(2)}`;
            clearInterval(counter);
        }
    }, 20); // Update every 20ms
}

// Show win message
function showWinMessage(amount, multiplier) {
    winMessageElement.style.display = 'block';
    
    if (multiplier > 0) {
        winAmountElement.innerHTML = `${amount.toFixed(2)} <span style="color: orange;">x${multiplier}</span>`;
    } else {
        winAmountElement.textContent = amount.toFixed(2);
    }
    
    // Hide win message after a delay
    setTimeout(() => {
        winMessageElement.style.display = 'none';
    }, 3000);
}


function rotateSpinButtonImage() {
    const spinButtonInnerImage = document.getElementById('spin_img');
    spinButtonInnerImage.style.transition = 'transform 0.5s ease';
    spinButtonInnerImage.style.transform = 'rotate(180deg)';
}

function resetSpinButtonImage() {
    const spinButtonInnerImage = document.getElementById('spin_img');
    spinButtonInnerImage.style.transition = 'transform 0.5s ease';
    spinButtonInnerImage.style.transform = 'rotate(360deg)';
}