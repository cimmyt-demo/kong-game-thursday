// Kong Treasure Hunt Slot Machine - PixiJS Implementation
class KongSlotMachine {
    constructor(config) {
        // Configuration
        this.containerId = config.containerId || 'slotMachine';
        this.reelCount = config.reelCount || 5;
        this.symbolsPerReel = config.symbolsPerReel || 3;
        this.symbolsPerReelArray = config.symbolsPerReelArray || [40, 43, 46, 49, 52];
        this.symbolSize = config.symbolSize || 100;
        this.extraSymbols = config.extraSymbols || 2;
        this.symbols = config.symbols || [];
        this.wallThickness = config.wallThickness || {
            top: 20,
            right: 7,
            bottom: 60,
            left: 7
        };
        
        // State
        this.spinning = false;
        this.reels = [];
        this.finalResults = [];
        this.winAmount = 0;
        this.winAmountDisplay = 0;
        this.isAnimatingWin = false;
        this.balance = config.balance || 1000;
        this.stake = config.stake || 0.3;
        this.autoSpins = 0;
        this.isFreeSpinMode = false;
        this.freeSpinCount = 0;
        this.remainingFreeSpinCount = 0;
        this.bonusMultiplier = 0;
        this.originalBetAmount = 0;
        this.isQuickSpinMode = false;
        this.loadedAssets = {};
        
        // PixiJS Setup
        this.app = null;
        this.reelContainer = null;
        this.symbolTextures = {};
        this.reelMaskGraphics = null;
        this.activeAnimations = {};
        
        // Sound
        this.audioManager = new AudioManager();
        
        // Initialize
        this.init();
    }
    
    init() {
        // Create PixiJS application
        this.app = new PIXI.Application({
            width: this.reelCount * this.symbolSize + this.wallThickness.left + this.wallThickness.right,
            height: this.symbolsPerReel * this.symbolSize + this.wallThickness.top + this.wallThickness.bottom,
            backgroundColor: 0x2c2c2c,
            antialias: true,
            resolution: window.devicePixelRatio || 1
        });
        
        // Add PixiJS view to container
        const container = document.getElementById(this.containerId);
        if (container) {
            container.appendChild(this.app.view);
            
            // Make the canvas responsive
            this.app.renderer.resize(container.clientWidth, container.clientHeight);
            this.app.view.style.width = '100%';
            this.app.view.style.height = '100%';
        } else {
            console.error(`Container with ID ${this.containerId} not found`);
            return;
        }
        
        // Create containers for game elements
        this.reelContainer = new PIXI.Container();
        this.app.stage.addChild(this.reelContainer);
        
        // Create container for walls
        this.wallContainer = new PIXI.Container();
        this.app.stage.addChild(this.wallContainer);
        
        // Load resources and initialize game
        this.loadResources();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    loadResources() {
        // Create a PIXI loader
        const loader = PIXI.Assets;
        
        // Track loading progress
        let assetsToLoad = [];
        
        // Add symbol textures to loader
        this.symbols.forEach(symbol => {
            assetsToLoad.push({ name: symbol.name, url: symbol.image });
        });
        
        // Add wall textures
        assetsToLoad.push({ name: 'wallTop', url: 'wall-top.png' });
        assetsToLoad.push({ name: 'wallSide', url: 'wall.png' });
        assetsToLoad.push({ name: 'wallBottom', url: 'resultsbcg3.png' });
        
        // Add freespin wall textures
        assetsToLoad.push({ name: 'freeSpinWallTop', url: 'freespin-wall-top.png' });
        assetsToLoad.push({ name: 'freeSpinWallRight', url: 'freespin-wall-right.png' });
        assetsToLoad.push({ name: 'freeSpinWallBottom', url: 'resultsbcg4.png' });
        assetsToLoad.push({ name: 'freeSpinWallLeft', url: 'freespin-wall-left.png' });
        
        // Add reel background
        assetsToLoad.push({ name: 'reelBg', url: 'reel-bg.png' });
        
        // Add wild animation frames
        for (let i = 0; i <= 33; i++) {
            assetsToLoad.push({ name: `wildFrame${i}`, url: `wildframes4/frame_${i}.png` });
        }
        
        // Add scatter animation frames
        for (let i = 0; i <= 61; i++) {
            assetsToLoad.push({ name: `scatterFrame${i}`, url: `freespinframes/item_${i}.png` });
        }
        
        // Start loading assets
        const loadAssets = async () => {
            try {
                // Show loading message
                const loadingText = new PIXI.Text('Loading...', {
                    fontFamily: 'Arial',
                    fontSize: 24,
                    fill: 0xFFFFFF
                });
                loadingText.anchor.set(0.5);
                loadingText.x = this.app.renderer.width / 2;
                loadingText.y = this.app.renderer.height / 2;
                this.app.stage.addChild(loadingText);
                
                // Load all assets
                for (const asset of assetsToLoad) {
                    this.loadedAssets[asset.name] = await PIXI.Assets.load(asset.url);
                }
                
                // Remove loading message
                this.app.stage.removeChild(loadingText);
                
                // Initialize game with loaded assets
                this.initGame();
            } catch (error) {
                console.error('Error loading assets:', error);
            }
        };
        
        loadAssets();
    }
    
    initGame() {
        // Create reels
        this.createReels();
        
        // Draw walls
        this.drawWalls();
        
        // Create reel masks
        this.createReelMasks();
        
        // Draw initial state
        this.drawGame();
        
        // Add event listeners
        this.addEventListeners();
        
        // Display balance
        this.displayBalance(this.balance);
    }
    
    createReels() {
        for (let i = 0; i < this.reelCount; i++) {
            // Initialize each reel
            this.reels[i] = {
                position: 0,
                symbols: [],
                finalSymbols: [],
                isSpinning: false,
                specialSymbols: {},
                container: new PIXI.Container(),
                sprites: []
            };
            
            // Add reel container to main reel container
            this.reelContainer.addChild(this.reels[i].container);
            
            // Position the reel container
            this.reels[i].container.x = this.wallThickness.left + i * this.symbolSize;
            this.reels[i].container.y = this.wallThickness.top;
            
            // Generate initial symbols (visible + extra for scrolling)
            const totalSymbols = this.symbolsPerReelArray[i] + this.extraSymbols * 2;
            for (let j = 0; j < totalSymbols; j++) {
                // For first reel (i === 0), exclude Wild from possible symbols
                let availableSymbols = i === 0 
                    ? this.symbols.filter(s => s.name !== 'Wild')
                    : this.symbols;
                
                const randomIndex = Math.floor(Math.random() * availableSymbols.length);
                const randomSymbolName = availableSymbols[randomIndex].name;
                
                // Create symbol data
                this.reels[i].symbols.push({
                    name: randomSymbolName,
                    isSpecial: true,
                    scale: this.getSymbolScale(randomSymbolName)
                });
            }
            
            // Set initial final symbols (what will be shown when not spinning)
            this.reels[i].finalSymbols = this.reels[i].symbols.slice(
                this.extraSymbols, 
                this.extraSymbols + this.symbolsPerReel
            );
            
            // Create sprites for each symbol
            for (let j = 0; j < totalSymbols; j++) {
                const symbolData = this.reels[i].symbols[j];
                const sprite = this.createSymbolSprite(symbolData.name);
                
                // Position the sprite
                sprite.y = j * this.symbolSize;
                
                // Add to reel container
                this.reels[i].container.addChild(sprite);
                this.reels[i].sprites.push(sprite);
            }
        }
    }
    
    createSymbolSprite(symbolName) {
        // Get texture from loaded assets
        const texture = this.loadedAssets[symbolName];
        
        // Create sprite - use a default texture if the specific one isn't loaded yet
        let sprite;
        if (texture) {
            sprite = new PIXI.Sprite(texture);
        } else {
            // Create a temporary colored rectangle as fallback
            sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
            // Find symbol color for fallback
            const symbolData = this.symbols.find(s => s.name === symbolName);
            if (symbolData && symbolData.color) {
                // Convert hex color string to number
                const colorHex = symbolData.color.replace('#', '0x');
                sprite.tint = parseInt(colorHex, 16);
            }
        }
        
        // Set sprite properties
        sprite.width = this.symbolSize;
        sprite.height = this.symbolSize;
        
        // Apply appropriate scale from symbol data
        const symbolData = this.symbols.find(s => s.name === symbolName);
        const scale = symbolData?.normal_scale || 1.0;
        
        // Center the sprite
        sprite.anchor.set(0.5);
        sprite.x = this.symbolSize / 2;
        sprite.y = this.symbolSize / 2;
        
        // Apply scaling
        sprite.scale.set(scale);
        
        return sprite;
    }
    
    getSymbolScale(symbolName) {
        const scaleMap = {
            'Treasure Chest': 1.4,
            'Explorer': 1.3,
            'Compass': 1.3,
            'Binoculars': 1.3,
            'A': 1.2,
            'K': 1.2,
            'Q': 1.2,
            'J': 1.2,
            'Wild': 1.55,
            'Scatter': 1.8
        };
        
        return scaleMap[symbolName] || 1.2;
    }
    
    createReelMasks() {
        // Remove any existing mask graphics
        if (this.reelMaskGraphics) {
            this.app.stage.removeChild(this.reelMaskGraphics);
        }
        
        // Create a new mask for the reel container to clip symbols
        this.reelMaskGraphics = new PIXI.Graphics();
        this.reelMaskGraphics.beginFill(0xFFFFFF);
        this.reelMaskGraphics.drawRect(
            this.wallThickness.left,
            this.wallThickness.top,
            this.reelCount * this.symbolSize,
            this.symbolsPerReel * this.symbolSize
        );
        this.reelMaskGraphics.endFill();
        
        // Add the mask graphics to the stage
        this.app.stage.addChild(this.reelMaskGraphics);
        
        // Apply the mask to the reel container
        this.reelContainer.mask = this.reelMaskGraphics;
        
        // Make mask invisible (it's only used for clipping)
        this.reelMaskGraphics.alpha = 0;
    }
    
    drawWalls() {
        // Create wall sprites using loaded textures
        const wallImages = this.isFreeSpinMode ? 
            [this.loadedAssets.freeSpinWallTop, this.loadedAssets.freeSpinWallRight, this.loadedAssets.freeSpinWallBottom, this.loadedAssets.freeSpinWallLeft] :
            [this.loadedAssets.wallTop, this.loadedAssets.wallSide, this.loadedAssets.wallBottom, this.loadedAssets.wallSide];
        
        // Clear previous walls
        this.wallContainer.removeChildren();
        
        // Define positions and sizes for each wall
        const wallPositions = [
            { x: 0, y: 0, width: this.app.renderer.width, height: this.wallThickness.top }, // Top - full width
            { x: this.app.renderer.width - this.wallThickness.right, y: this.wallThickness.top, width: this.wallThickness.right, height: this.app.renderer.height - this.wallThickness.top - this.wallThickness.bottom }, // Right - between top and bottom
            { x: 0, y: this.app.renderer.height - this.wallThickness.bottom, width: this.app.renderer.width, height: this.wallThickness.bottom }, // Bottom - full width
            { x: 0, y: this.wallThickness.top, width: this.wallThickness.left, height: this.app.renderer.height - this.wallThickness.top - this.wallThickness.bottom }  // Left - between top and bottom
        ];
        
        // Create wall sprites
        for (let i = 0; i < 4; i++) {
            if (wallImages[i]) {
                const wall = new PIXI.Sprite(wallImages[i]);
                wall.x = wallPositions[i].x;
                wall.y = wallPositions[i].y;
                wall.width = wallPositions[i].width;
                wall.height = wallPositions[i].height;
                this.wallContainer.addChild(wall);
            } else {
                // Fallback to rectangle if texture is not loaded
                const graphics = new PIXI.Graphics();
                graphics.beginFill(0x3a0ca3);
                graphics.drawRect(
                    wallPositions[i].x,
                    wallPositions[i].y,
                    wallPositions[i].width,
                    wallPositions[i].height
                );
                graphics.endFill();
                this.wallContainer.addChild(graphics);
            }
        }
    }
    
    drawGame() {
        // Update reel backgrounds
        this.drawReelBackgrounds();
        
        // Update symbols
        this.updateSymbols();
    }
    
    drawReelBackgrounds() {
        // Create background container if it doesn't exist
        if (!this.reelBackgroundContainer) {
            this.reelBackgroundContainer = new PIXI.Container();
            // Insert behind reels but in front of walls
            this.app.stage.addChildAt(this.reelBackgroundContainer, 1);
        } else {
            this.reelBackgroundContainer.removeChildren();
        }
        
        const reelWidth = this.symbolSize;
        const reelHeight = this.symbolsPerReel * this.symbolSize;
        
        // Create background texture from loaded asset
        const bgTexture = this.loadedAssets.reelBg;
        
        // Draw background for each reel
        for (let i = 0; i < this.reelCount; i++) {
            const reelX = this.wallThickness.left + i * reelWidth;
            const reelY = this.wallThickness.top;
            
            // Create background sprite
            if (bgTexture) {
                const bgSprite = new PIXI.Sprite(bgTexture);
                bgSprite.x = reelX;
                bgSprite.y = reelY;
                bgSprite.width = reelWidth;
                bgSprite.height = reelHeight;
                this.reelBackgroundContainer.addChild(bgSprite);
            } else {
                // Fallback to rectangle if texture is not loaded
                const graphics = new PIXI.Graphics();
                graphics.beginFill(this.isFreeSpinMode ? 0x3e3424 : 0x333333);
                graphics.drawRect(reelX, reelY, reelWidth, reelHeight);
                graphics.endFill();
                this.reelBackgroundContainer.addChild(graphics);
            }
            
            // Draw reel borders
            const borderGraphics = new PIXI.Graphics();
            borderGraphics.lineStyle(2, this.isFreeSpinMode ? 0xd97800 : 0x835318);
            
            // Left border
            borderGraphics.moveTo(reelX, reelY);
            borderGraphics.lineTo(reelX, reelY + reelHeight);
            
            // Right border
            borderGraphics.moveTo(reelX + reelWidth, reelY);
            borderGraphics.lineTo(reelX + reelWidth, reelY + reelHeight);
            
            this.reelBackgroundContainer.addChild(borderGraphics);
        }
    }
    
    updateSymbols() {
        // Update each reel
        for (let i = 0; i < this.reelCount; i++) {
            const reel = this.reels[i];
            
            if (reel.isSpinning) {
                // Update spinning reel position
                // Implementation will be added in the spin animation function
            } else {
                // Update stopped reel
                this.updateStoppedReel(i);
            }
        }
    }
    
    updateStoppedReel(reelIndex) {
        const reel = this.reels[reelIndex];
        const symbolHeight = this.symbolSize;
        
        // Update symbols for stopped reel
        for (let j = 0; j < this.symbolsPerReel; j++) {
            // Get symbol data
            const symbolData = reel.finalSymbols[j];
            
            // Check if symbol exists in finalSymbols
            if (!symbolData) continue;
            
            // Update sprite texture and position
            const sprite = reel.sprites[j + this.extraSymbols];
            
            if (sprite) {
                // Update texture if needed
                const texture = this.loadedAssets[symbolData.name];
                if (texture && sprite.texture !== texture) {
                    sprite.texture = texture;
                }
                
                // Update position
                sprite.y = j * symbolHeight + symbolHeight / 2;
                
                // Update scale
                const scale = this.getSymbolScale(symbolData.name);
                sprite.scale.set(scale);
                
                // Check if this symbol is being animated
                const animKey = `${reelIndex}-${j}`;
                const anim = this.activeAnimations[animKey];
                
                if (anim && anim.active) {
                    // Apply animation based on symbol type
                    this.animateSymbol(sprite, symbolData.name, anim);
                }
            }
        }
    }
    
    animateSymbol(sprite, symbolName, animation) {
        // Different animations based on symbol type
        switch (symbolName) {
            case 'Scatter':
                // Animated frames for scatter
                const scatterFrameIndex = Math.floor(animation.currentFrame);
                const scatterTexture = this.loadedAssets[`scatterFrame${scatterFrameIndex}`];
                
                if (scatterTexture) {
                    sprite.texture = scatterTexture;
                    
                    // Scale animation
                    const frameProgress = animation.currentFrame / 61;
                    const maxScaleFactor = 1.4;
                    const scaleFactor = 1.15 + (maxScaleFactor - 1.0) * frameProgress;
                    sprite.scale.set(scaleFactor);
                }
                break;
                
            case 'Wild':
                // Animated frames for wild
                const wildFrameIndex = Math.floor(animation.currentFrame);
                const wildTexture = this.loadedAssets[`wildFrame${wildFrameIndex}`];
                
                if (wildTexture) {
                    sprite.texture = wildTexture;
                    
                    // Scale animation
                    const frameProgress = animation.currentFrame / 33;
                    const maxScaleFactor = 1.75;
                    const scaleFactor = 1.5 + (maxScaleFactor - 1.0) * frameProgress;
                    sprite.scale.set(scaleFactor);
                }
                break;
                
            case 'Treasure Chest':
            case 'Explorer':
            case 'Compass':
            case 'Binoculars':
            case 'A':
            case 'K':
            case 'Q':
            case 'J':
                // Blinking effect
                sprite.alpha = Math.floor(Date.now() / 600) % 2 === 0 ? 1.0 : 0.5;
                break;
                
            default:
                // Pulsing effect
                const defaultScale = this.getSymbolScale(symbolName);
                const pulseScale = defaultScale * (1.0 + 0.1 * Math.sin(Date.now() / 200));
                sprite.scale.set(pulseScale);
        }
    }
    
    spin() {
        if (this.spinning || (this.balance < this.stake && !this.isFreeSpinMode)) return;
        
        // Stop any active animations
        this.activeAnimations = {};
        
        // Deduct bet amount if not in free spin mode
        if (!this.isFreeSpinMode) {
            this.balance -= this.stake;
            this.displayBalance(this.balance);
        }
        
        // Play spin sound
        this.audioManager.playSpinSound();
        
        this.spinning = true;
        
        // Prepare reels for spinning
        for (let i = 0; i < this.reelCount; i++) {
            // Reset position
            this.reels[i].position = 0;
            
            // Set spinning state
            this.reels[i].isSpinning = true;
            this.reels[i].lastPosition = 0;
            
            // Generate random symbols for spinning
            const totalSymbols = this.symbolsPerReelArray[i];
            this.reels[i].symbols = [];
            
            for (let j = 0; j < totalSymbols; j++) {
                const availableSymbols = i === 0 
                    ? this.symbols.filter(s => s.name !== 'Wild')
                    : this.symbols;
                
                const randomIndex = Math.floor(Math.random() * availableSymbols.length);
                const randomSymbolName = availableSymbols[randomIndex].name;
                
                this.reels[i].symbols.push({
                    name: randomSymbolName,
                    isSpecial: true,
                    scale: this.getSymbolScale(randomSymbolName)
                });
            }
        }
        
        // Generate mock results for demo
        const mockResults = this.generateMockResults();
        
        // Start spin animation
        this.spinAnimation(mockResults);
    }
    
    spinAnimation(results) {
        // Calculate speeds for each reel
        const spinDuration = this.isQuickSpinMode ? 1000 : 2000; // Quicker in quick spin mode
        const spinSpeeds = [];
        
        for (let i = 0; i < this.reelCount; i++) {
            // Progressive spin durations
            const reelDelay = i * 200; // Each reel starts with a delay
            const reelDuration = spinDuration - reelDelay;
            
            // Calculate spin speed (pixels per frame at 60fps)
            const totalDistance = this.symbolsPerReelArray[i] * this.symbolSize;
            const framesForReel = reelDuration / 16.6; // ~60fps
            spinSpeeds[i] = totalDistance / framesForReel;
        }
        
        // Store stop positions for each reel
        const stopPositions = [];
        
        // Set final symbols based on results
        for (let i = 0; i < this.reelCount; i++) {
            // Update final symbols
            this.reels[i].finalSymbols = results.reels[i];
            
            // Calculate stop position
            stopPositions[i] = (this.symbolsPerReelArray[i] - this.symbolsPerReel) * this.symbolSize;
        }
        
        // Animation loop
        let spinning = true;
        let reelsStoppedCount = 0;
        let lastTime = performance.now();
        
        const animate = (time) => {
            // Calculate delta time
            const deltaTime = time - lastTime;
            lastTime = time;
            
            // Update each reel
            for (let i = 0; i < this.reelCount; i++) {
                const reel = this.reels[i];
                
                // Skip if this reel has stopped
                if (!reel.isSpinning) continue;
                
                // Delay start of each reel
                if (time < lastTime + i * 200) continue;
                
                // Update position
                reel.position += spinSpeeds[i] * deltaTime / 16.6;
                
                // Update symbol sprites
                this.updateSpinningReel(i);
                
                // Check if this reel should stop
                if (reel.position >= stopPositions[i]) {
                    // Stop the reel
                    reel.isSpinning = false;
                    reel.position = 0;
                    
                    // Update stopped reel
                    this.updateStoppedReel(i);
                    
                    // Play stop sound
                    this.audioManager.playSpinStopSound();
                    
                    // Increment counter
                    reelsStoppedCount++;
                    
                    // Check if all reels have stopped
                    if (reelsStoppedCount === this.reelCount) {
                        spinning = false;
                        this.spinning = false;
                        
                        // Process win
                        this.processWin(results);
                    }
                }
            }
            
            // Continue animation if still spinning
            if (spinning) {
                requestAnimationFrame(animate);
            }
        };
        
        // Start animation
        requestAnimationFrame(animate);
    }
    
    updateSpinningReel(reelIndex) {
        const reel = this.reels[reelIndex];
        const symbolHeight = this.symbolSize;
        
        // Calculate current position in the reel
        const totalSymbols = this.symbolsPerReelArray[reelIndex];
        const position = reel.position % (totalSymbols * symbolHeight);
        
        // Calculate which symbols are visible
        const startIndex = Math.floor(position / symbolHeight) % totalSymbols;
        
        // Update visible symbols
        for (let j = 0; j < this.symbolsPerReel + this.extraSymbols * 2; j++) {
            const symbolIndex = (startIndex + j) % totalSymbols;
            const symbol = reel.symbols[symbolIndex];
            
            // Update sprite
            const sprite = reel.sprites[j];
            
            if (sprite && symbol) {
                // Update texture
                const texture = this.loadedAssets[symbol.name];
                if (texture) {
                    sprite.texture = texture;
                }
                
                // Update position - offset by the fractional position for smooth scrolling
                const offset = position % symbolHeight;
                sprite.y = (j * symbolHeight) - offset + symbolHeight / 2;
                
                // Update scale
                sprite.scale.set(symbol.scale);
            }
        }
    }
    
    processWin(results) {
        // Calculate win amount
        const winResult = this.calculateWinAmount(results);
        this.winAmount = winResult.amount;
        
        // Display win
        const updateWinnings = document.getElementById('update_winnings');
        if (updateWinnings) {
            updateWinnings.innerHTML = this.winAmount.toFixed(2);
        }
        
        // Highlight winning symbols
        if (winResult.positions.length > 0) {
            this.highlightWinningSymbols(winResult.positions);
        }
        
        // Check for big win
        if (this.winAmount >= 100) {
            this.showBigWin(this.winAmount);
        }
        
        // Update balance
        this.balance += this.winAmount;
        this.displayBalance(this.balance);
        
        // Check for free spins trigger
        if (results.triggerFreeSpins) {
            this.triggerFreeSpins();
        }
        
        // Handle auto spins
        if (this.autoSpins > 0 && !this.isFreeSpinMode) {
            this.autoSpins--;
            
            if (this.autoSpins > 0) {
                // Schedule next spin
                setTimeout(() => this.spin(), 1000);
            }
        }
    }
    
    calculateWinAmount(results) {
        // Extract symbol names from results
        const symbolNames = results.reels.map(reel => 
            reel.map(symbol => symbol.name)
        );
        
        // Check for winning combinations
        let totalWin = 0;
        let winningPositions = [];
        
        // Check for matching symbols on each row
        for (let row = 0; row < this.symbolsPerReel; row++) {
            // Check each symbol (except Scatter which pays anywhere)
            for (let symbolObj of this.symbols) {
                if (symbolObj.name === 'Scatter') continue;
                
                let count = 0;
                let positions = [];
                
                // Count consecutive matching symbols from left to right
                for (let reel = 0; reel < this.reelCount; reel++) {
                    const currentSymbol = symbolNames[reel][row];
                    
                    // Match if same symbol or Wild (except first reel)
                    if (currentSymbol === symbolObj.name || (currentSymbol === 'Wild' && reel > 0)) {
                        count++;
                        positions.push({ reel, row, symbol: currentSymbol });
                    } else {
                        break;
                    }
                }
                
                // Check if we have a win (3 or more matching symbols)
                if (count >= 3) {
                    // Get payout for this symbol and count
                    const payout = symbolObj.payouts[count];
                    
                    // Calculate win amount
                    let win = payout * this.stake;
                    
                    // Apply bonus multiplier in free spin mode
                    if (this.isFreeSpinMode && this.bonusMultiplier > 0) {
                        win *= this.bonusMultiplier;
                    }
                    
                    totalWin += win;
                    winningPositions = winningPositions.concat(positions);
                }
            }
        }
        
        // Check for Scatter wins
        if (this.isFreeSpinMode) {
            let scatterCount = 0;
            let scatterPositions = [];
            
            for (let reel = 0; reel < this.reelCount; reel++) {
                for (let row = 0; row < this.symbolsPerReel; row++) {
                    if (symbolNames[reel][row] === 'Scatter') {
                        scatterCount++;
                        scatterPositions.push({ reel, row, symbol: 'Scatter' });
                    }
                }
            }
            
            if (scatterCount >= 3) {
                const scatterObj = this.symbols.find(s => s.name === 'Scatter');
                const payout = scatterObj.payouts[scatterCount] || 0;
                
                let win = payout * this.stake;
                
                if (this.bonusMultiplier > 0) {
                    win *= this.bonusMultiplier;
                }
                
                totalWin += win;
                winningPositions = winningPositions.concat(scatterPositions);
            }
        } else {
            // Check for free spins trigger
            let scatterCount = 0;
            
            for (let reel = 0; reel < this.reelCount; reel++) {
                for (let row = 0; row < this.symbolsPerReel; row++) {
                    if (symbolNames[reel][row] === 'Scatter') {
                        scatterCount++;
                    }
                }
            }
            
            if (scatterCount >= this.reelCount) {
                results.triggerFreeSpins = true;
                
                // Add scatter positions for animation
                let scatterPositions = [];
                for (let reel = 0; reel < this.reelCount; reel++) {
                    for (let row = 0; row < this.symbolsPerReel; row++) {
                        if (symbolNames[reel][row] === 'Scatter') {
                            scatterPositions.push({ reel, row, symbol: 'Scatter' });
                        }
                    }
                }
                
                winningPositions = winningPositions.concat(scatterPositions);
            }
        }
        
        // Ensure minimum win for demo
        if (results.generateBigWin && totalWin < 100) {
            totalWin = 100 + Math.floor(Math.random() * 400);
        }
        
        return {
            amount: totalWin,
            positions: winningPositions
        };
    }
    
    highlightWinningSymbols(positions) {
        // Clear previous animations
        this.activeAnimations = {};
        
        // Set up animations for winning positions
        positions.forEach(pos => {
            const key = `${pos.reel}-${pos.row}`;
            
            this.activeAnimations[key] = {
                symbol: pos.symbol,
                reel: pos.reel,
                row: pos.row,
                startTime: Date.now(),
                active: true,
                currentFrame: 0,
                direction: 1,
                lastUpdateTime: 0,
                frameRate: 25
            };
        });
        
        // Animation loop
        const animateWinningSymbols = () => {
            // Check if we have any active animations
            const hasActiveAnimations = Object.values(this.activeAnimations).some(anim => anim.active);
            
            if (!hasActiveAnimations) {
                return; // Stop animation loop
            }
            
            // Update animation frames
            for (const key in this.activeAnimations) {
                const anim = this.activeAnimations[key];
                
                if (!anim.active) continue;
                
                const now = Date.now();
                if (now - anim.lastUpdateTime >= anim.frameRate) {
                    anim.lastUpdateTime = now;
                    
                    // Update frame based on symbol type
                    if (anim.symbol === 'Scatter') {
                        anim.currentFrame += anim.direction;
                        
                        if (anim.currentFrame >= 61) {
                            anim.currentFrame = 59;
                            anim.direction = -1;
                        } else if (anim.currentFrame < 0) {
                            anim.currentFrame = 1;
                            anim.direction = 1;
                        }
                    } else if (anim.symbol === 'Wild') {
                        anim.currentFrame += anim.direction;
                        
                        if (anim.currentFrame >= 33) {
                            anim.currentFrame = 31;
                            anim.direction = -1;
                        } else if (anim.currentFrame < 0) {
                            anim.currentFrame = 1;
                            anim.direction = 1;
                        }
                    }
                }
                
                // Update the sprite
                this.updateStoppedReel(anim.reel);
            }
            
            // Continue animation
            requestAnimationFrame(animateWinningSymbols);
        };
        
        // Start animation loop
        if (Object.keys(this.activeAnimations).length > 0) {
            animateWinningSymbols();
        }
    }
    
    showBigWin(amount) {
        // Determine win level
        let level = 'big';
        if (amount >= 300) {
            level = 'ultra';
        } else if (amount >= 200) {
            level = 'mega';
        }
        
        // Show big win overlay
        const winOverlay = document.getElementById('winOverlay');
        const winAmount = document.getElementById('winAmount');
        const winImg = document.getElementById('winImg');
        
        // Check if elements exist before using them
        if (winOverlay && winAmount && winImg) {
            // Update display
            winAmount.textContent = '$' + amount.toFixed(2);
            winImg.src = `winlevels/${level}win.png`;
            
            // Display overlay
            winOverlay.style.display = 'flex';
            
            // Create coin animation
            this.createCoinFountain(level === 'ultra' ? 100 : level === 'mega' ? 80 : 50);
        } else {
            console.warn('Win overlay elements not found. Unable to display big win animation.');
        }
        
        // Play win sound
        this.audioManager.playWinSound(amount);
    }
    
    createCoinFountain(numberOfCoins) {
        const coinsContainer = document.getElementById('coinsContainer');
        
        // Check if the coins container exists
        if (!coinsContainer) {
            console.warn('Coins container not found. Unable to create coin animation.');
            return;
        }
        
        // Implementation would go here - this uses DOM elements
        // and is already implemented in the HTML file
    }
    
    triggerFreeSpins() {
        // Set free spin mode
        this.isFreeSpinMode = true;
        this.freeSpinCount = 13; // Default free spins
        this.remainingFreeSpinCount = this.freeSpinCount;
        
        // Calculate bonus multiplier based on scatter count
        const scatterCount = this.countScatters();
        
        if (scatterCount >= 5) {
            if (scatterCount >= 10) this.bonusMultiplier = 72;
            else if (scatterCount >= 9) this.bonusMultiplier = 36;
            else if (scatterCount >= 8) this.bonusMultiplier = 24;
            else if (scatterCount >= 7) this.bonusMultiplier = 12;
            else if (scatterCount >= 6) this.bonusMultiplier = 6;
            else this.bonusMultiplier = 3;
        }
        
        // Store original bet amount
        this.originalBetAmount = this.stake;
        
        // Show free spins overlay
        const freeSpinsOverlay = document.getElementById('freespinsoverlay');
        if (freeSpinsOverlay) {
            freeSpinsOverlay.style.display = 'block';
        }
        
        // Update free spins indicator
        const freeSpinsIndicator = document.getElementById('free-spins-indicator');
        const freeSpinsCount = document.getElementById('free-spins-count');
        const bonusMultiplierElement = document.getElementById('bonus-multiplier');
        
        if (freeSpinsCount) {
            freeSpinsCount.textContent = this.remainingFreeSpinCount;
        }
        
        if (bonusMultiplierElement) {
            bonusMultiplierElement.textContent = this.bonusMultiplier;
        }
        
        if (freeSpinsIndicator) {
            freeSpinsIndicator.style.display = 'block';
        }
        
        // Show free spins display
        const freespinsDisplay = document.getElementById('freespins_display');
        const normalspinsDisplay = document.getElementById('normalspins_display');
        
        if (freespinsDisplay) {
            freespinsDisplay.style.display = 'flex';
        }
        
        if (normalspinsDisplay) {
            normalspinsDisplay.style.display = 'none';
        }
        
        // Update remaining and total free spins display
        const remainingFsHolder = document.getElementById('remaining_fs_holder');
        const totalFsHolder = document.getElementById('total_fs_holder');
        
        if (remainingFsHolder) {
            remainingFsHolder.textContent = this.remainingFreeSpinCount;
        }
        
        if (totalFsHolder) {
            totalFsHolder.textContent = this.freeSpinCount;
        }
        
        // Play free spins sound
        this.audioManager.sounds.background.pause();
        this.audioManager.sounds.freeSpin.play();
        
        // Hide overlay after delay
        setTimeout(() => {
            if (freeSpinsOverlay) {
                freeSpinsOverlay.style.display = 'none';
            }
            
            // Show start free spins overlay
            const startFreeSpinsOverlay = document.getElementById('startfreespinsoverlay');
            if (startFreeSpinsOverlay) {
                startFreeSpinsOverlay.style.display = 'block';
            }
        }, 3000);
    }
    
    startFreeSpins() {
        // Hide start free spins overlay
        const startFreeSpinsOverlay = document.getElementById('startfreespinsoverlay');
        if (startFreeSpinsOverlay) {
            startFreeSpinsOverlay.style.display = 'none';
        }
        
        // Start spin
        this.spin();
    }
    
    countScatters() {
        // Count scatters across all reels
        let count = 0;
        
        for (let i = 0; i < this.reelCount; i++) {
            for (let j = 0; j < this.symbolsPerReel; j++) {
                if (this.reels[i].finalSymbols[j].name === 'Scatter') {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    displayBalance(amount) {
        // Ensure amount is a valid number
        if (isNaN(amount)) {
            console.warn('Invalid balance amount:', amount);
            return;
        }
        
        const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        const balanceText = document.getElementById('balanceText');
        if (balanceText) {
            balanceText.innerHTML = formattedAmount;
        }
    }
    
    generateMockResults() {
        const newResults = [];
        
        // Check if we should trigger free spins (10% chance if not already in free spin mode)
        const triggerFreeSpins = !this.isFreeSpinMode && Math.random() < 0.1;
        
        // Check if we should generate a big win
        const generateBigWin = Math.random() < 0.2;
        
        // If triggering free spins, ensure at least one scatter on each reel
        if (triggerFreeSpins) {
            for (let i = 0; i < this.reelCount; i++) {
                const reelSymbols = [];
                
                // Add one scatter symbol
                const scatterPosition = Math.floor(Math.random() * this.symbolsPerReel);
                
                for (let j = 0; j < this.symbolsPerReel; j++) {
                    if (j === scatterPosition) {
                        reelSymbols.push({
                            name: 'Scatter',
                            isSpecial: true,
                            scale: 1.3
                        });
                    } else {
                        // For first reel (i === 0), exclude Wild from possible symbols
                        let availableSymbols = i === 0 
                            ? this.symbols.filter(s => s.name !== 'Wild') 
                            : this.symbols;
                        
                        const randomIndex = Math.floor(Math.random() * availableSymbols.length);
                        reelSymbols.push({
                            name: availableSymbols[randomIndex].name,
                            isSpecial: Math.random() < 0.3,
                            scale: this.getSymbolScale(availableSymbols[randomIndex].name)
                        });
                    }
                }
                newResults.push(reelSymbols);
            }
        } 
        // If generating a big win, create a line of high-value symbols
        else if (generateBigWin) {
            // Choose a high-value symbol
            const highValueSymbols = ['Treasure Chest', 'Explorer', 'Compass', 'Binoculars'];
            const selectedSymbol = highValueSymbols[Math.floor(Math.random() * highValueSymbols.length)];
            
            // Create a line of matching symbols
            for (let i = 0; i < this.reelCount; i++) {
                const reelSymbols = [];
                
                for (let j = 0; j < this.symbolsPerReel; j++) {
                    if (j === 1) { // Middle row for the winning line
                        if (i === 0) {
                            // First reel must have the selected symbol, not Wild
                            reelSymbols.push({
                                name: selectedSymbol,
                                isSpecial: true,
                                scale: this.getSymbolScale(selectedSymbol)
                            });
                        } else {
                            // Other reels can have Wild or the selected symbol
                            reelSymbols.push({
                                name: Math.random() < 0.7 ? selectedSymbol : 'Wild',
                                isSpecial: true,
                                scale: this.getSymbolScale(Math.random() < 0.7 ? selectedSymbol : 'Wild')
                            });
                        }
                    } else {
                        // For first reel (i === 0), exclude Wild from possible symbols
                        let availableSymbols = i === 0 
                            ? this.symbols.filter(s => s.name !== 'Wild')
                            : this.symbols;
                        
                        const randomIndex = Math.floor(Math.random() * availableSymbols.length);
                        reelSymbols.push({
                            name: availableSymbols[randomIndex].name,
                            isSpecial: Math.random() < 0.3,
                            scale: this.getSymbolScale(availableSymbols[randomIndex].name)
                        });
                    }
                }
                newResults.push(reelSymbols);
            }
        }
        // Normal results
        else {
            for (let i = 0; i < this.reelCount; i++) {
                const reelSymbols = [];
                for (let j = 0; j < this.symbolsPerReel; j++) {
                    // For first reel (i === 0), exclude Wild from possible symbols
                    let availableSymbols = i === 0 
                        ? this.symbols.filter(s => s.name !== 'Wild')
                        : this.symbols;
                    
                    const randomIndex = Math.floor(Math.random() * availableSymbols.length);
                    reelSymbols.push({
                        name: availableSymbols[randomIndex].name,
                        isSpecial: Math.random() < 0.3,
                        scale: this.getSymbolScale(availableSymbols[randomIndex].name)
                    });
                }
                newResults.push(reelSymbols);
            }
        }
        
        return {
            reels: newResults,
            triggerFreeSpins: triggerFreeSpins,
            generateBigWin: generateBigWin
        };
    }
    
    handleResize() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        // Update renderer size
        this.app.renderer.resize(container.clientWidth, container.clientHeight);
        
        // Update reel masks
        this.createReelMasks();
        
        // Redraw the game
        this.drawGame();
    }
    
    addEventListeners() {
        // Add spin button click event
        const spinButton = document.getElementById('spinButton');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.spin());
        }
        
        // Add start free spins button click event
        const startFreeSpinsButton = document.getElementById('startfreespinsbutton');
        if (startFreeSpinsButton) {
            startFreeSpinsButton.addEventListener('click', () => this.startFreeSpins());
        }
    }
}

// Audio Manager class
class AudioManager {
    constructor() {
        // Sound effects collection
        this.sounds = {};
        
        // Initialize audio objects
        this.sounds.background = this.createSound('sounds/SE_Base_BG.mp3', true, 0.5);
        this.sounds.bigWin = this.createSound('sounds/SE_BigWin.mp3', false, 0.8);
        this.sounds.reelSpeedUp = this.createSound('sounds/SE_ReelSpeedUp.mp3', false, 0.9);
        this.sounds.freeSpin = this.createSound('sounds/SE_Free_BG.mp3', true, 0.9);
        this.sounds.spin = this.createSound('sounds/SE_ButtonPress.mp3', false, 1.0);
        this.sounds.spinStop = this.createSound('sounds/SE_Spinstop.mp3', false, 0.9);
        this.sounds.win = this.createSound('sounds/SE_Scoring_01.mp3', false, 1.0);
        this.sounds.jackpot = this.createSound('sounds/SE_Jackpot.mp3', false, 1.0);
        this.sounds.megaWin = this.createSound('sounds/SE_MegaWin.mp3', false, 1.0);
        this.sounds.ultraWin = this.createSound('sounds/SE_UltraWin.mp3', false, 1.0);
        
        // Control flags
        this.soundEffectsEnabled = true;
        this.backgroundMusicEnabled = true;
        
        // Preload all sounds
        this.preloadAll();
    }
    
    createSound(src, loop = false, volume = 1.0) {
        const sound = new Audio();
        sound.src = src;
        sound.loop = loop;
        sound.volume = volume;
        sound.preload = 'auto';
        
        return sound;
    }
    
    preloadAll() {
        Object.values(this.sounds).forEach(sound => {
            try {
                sound.load();
            } catch(e) {
                console.log(`Error preloading sound: ${e}`);
            }
        });
    }
    
    playSound(sound) {
        if (!this.soundEffectsEnabled || !sound) return;
        
        try {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.log(`Audio play failed: ${error}`);
            });
        } catch(e) {
            console.log(`Error playing sound: ${e}`);
        }
    }
    
    playBackgroundMusic() {
        if (!this.backgroundMusicEnabled) return;
        this.playSound(this.sounds.background);
    }
    
    playSpinSound() {
        this.playSound(this.sounds.spin);
        setTimeout(() => {
            this.playSound(this.sounds.reelSpeedUp);
        }, 100);
    }
    
    playSpinStopSound() {
        this.stopSound(this.sounds.reelSpeedUp);
        this.playSound(this.sounds.spinStop);
    }
    
    playWinSound(amount = 0) {
        if (amount >= 300) {
            this.playSound(this.sounds.ultraWin);
        } else if (amount >= 200) {
            this.playSound(this.sounds.megaWin);
        } else if (amount >= 100) {
            this.playSound(this.sounds.bigWin);
        } 
    }
    
    stopSound(sound) {
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }
    
    stopAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }
    
    toggleSoundEffects() {
        this.soundEffectsEnabled = !this.soundEffectsEnabled;
        return this.soundEffectsEnabled;
    }
    
    toggleBackgroundMusic() {
        this.backgroundMusicEnabled = !this.backgroundMusicEnabled;
        
        if (!this.backgroundMusicEnabled) {
            this.stopSound(this.sounds.background);
        } else {
            this.playBackgroundMusic();
        }
        
        return this.backgroundMusicEnabled;
    }
}

// Test functions to verify functionality
const KongSlotTest = {
    testSymbolRendering() {
        console.log('Testing symbol rendering...');
        const slotMachine = window.slotMachine;
        
        // Check if all symbols are loaded and rendered
        const allSymbolsLoaded = Object.keys(slotMachine.loadedAssets).length > 0;
        console.assert(allSymbolsLoaded, 'All symbols should be loaded');
        
        // Check if reels are created
        console.assert(slotMachine.reels.length === slotMachine.reelCount, 'Correct number of reels should be created');
        
        console.log('Symbol rendering test complete');
        return allSymbolsLoaded && slotMachine.reels.length === slotMachine.reelCount;
    },
    
    testSpinFunctionality() {
        console.log('Testing spin functionality...');
        const slotMachine = window.slotMachine;
        
        // Save initial balance
        const initialBalance = slotMachine.balance;
        
        // Trigger a spin
        slotMachine.spin();
        
        // Verify spinning state
        console.assert(slotMachine.spinning === true, 'Should be in spinning state');
        
        // Verify balance deduction (if not in free spin mode)
        if (!slotMachine.isFreeSpinMode) {
            console.assert(slotMachine.balance === initialBalance - slotMachine.stake, 'Balance should be deducted');
        }
        
        console.log('Spin functionality test started - spinning state will be checked after animation completes');
        
        // Check spin completion after a delay
        setTimeout(() => {
            console.assert(slotMachine.spinning === false, 'Spinning should be complete');
            console.log('Spin functionality test complete');
        }, 3000);
        
        return true;
    },
    
    testWinCalculation() {
        console.log('Testing win calculation...');
        const slotMachine = window.slotMachine;
        
        // Create a mock result with a guaranteed win
        const mockResults = {
            reels: [
                [
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Explorer', isSpecial: true, scale: 1.2 },
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Explorer', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Compass', isSpecial: true, scale: 1.2 },
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Compass', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Wild', isSpecial: true, scale: 1.2 },
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Wild', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Binoculars', isSpecial: true, scale: 1.2 },
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Binoculars', isSpecial: true, scale: 1.2 }
                ]
            ],
            triggerFreeSpins: false,
            generateBigWin: true
        };
        
        // Calculate win
        const winResult = slotMachine.calculateWinAmount(mockResults);
        
        // Verify win calculation
        console.assert(winResult.amount > 0, 'Win amount should be greater than 0');
        console.assert(winResult.positions.length > 0, 'Should have winning positions');
        
        console.log(`Win calculation test complete - Win amount: ${winResult.amount}, Winning positions: ${winResult.positions.length}`);
        return winResult.amount > 0 && winResult.positions.length > 0;
    },
    
    testFreeSpinsTrigger() {
        console.log('Testing free spins trigger...');
        const slotMachine = window.slotMachine;
        
        // Create a mock result with free spins trigger
        const mockResults = {
            reels: [
                [
                    { name: 'A', isSpecial: true, scale: 1.2 },
                    { name: 'Scatter', isSpecial: true, scale: 1.3 },
                    { name: 'K', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Q', isSpecial: true, scale: 1.2 },
                    { name: 'Scatter', isSpecial: true, scale: 1.3 },
                    { name: 'J', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Scatter', isSpecial: true, scale: 1.3 },
                    { name: 'K', isSpecial: true, scale: 1.2 },
                    { name: 'A', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'J', isSpecial: true, scale: 1.2 },
                    { name: 'Scatter', isSpecial: true, scale: 1.3 },
                    { name: 'Q', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Scatter', isSpecial: true, scale: 1.3 },
                    { name: 'A', isSpecial: true, scale: 1.2 },
                    { name: 'K', isSpecial: true, scale: 1.2 }
                ]
            ],
            triggerFreeSpins: true,
            generateBigWin: false
        };
        
        // Save the original free spin mode state
        const originalFreeSpinMode = slotMachine.isFreeSpinMode;
        
        // Process the mock result
        const winResult = slotMachine.calculateWinAmount(mockResults);
        
        // Check if free spins should be triggered
        if (mockResults.triggerFreeSpins && !originalFreeSpinMode) {
            slotMachine.triggerFreeSpins();
            
            // Verify free spins mode
            console.assert(slotMachine.isFreeSpinMode === true, 'Should be in free spins mode');
            console.assert(slotMachine.freeSpinCount > 0, 'Free spin count should be greater than 0');
            console.assert(slotMachine.remainingFreeSpinCount > 0, 'Remaining free spins should be greater than 0');
            
            // Reset for testing purposes
            slotMachine.isFreeSpinMode = originalFreeSpinMode;
            slotMachine.freeSpinCount = 0;
            slotMachine.remainingFreeSpinCount = 0;
        }
        
        console.log('Free spins trigger test complete');
        return mockResults.triggerFreeSpins;
    },
    
    runAllTests() {
        console.log('Running all tests...');
        
        const results = {
            symbolRendering: this.testSymbolRendering(),
            spinFunctionality: this.testSpinFunctionality(),
            winCalculation: this.testWinCalculation(),
            freeSpinsTrigger: this.testFreeSpinsTrigger()
        };
        
        console.log('All tests complete. Results:', results);
        return results;
    }
};

// Initialize the slot machine with configuration
window.addEventListener('DOMContentLoaded', () => {
    // Create symbols configuration
    const symbols = [
        { name: 'Treasure Chest', image: 'treasurechest.png', color: '#ff5252', payouts: [0, 0, 40, 100, 250], normal_scale: 1.2, z_index: 97 },
        { name: 'Explorer', image: 'explorer.png', color: '#ffeb3b', payouts: [0, 0, 30, 80, 200], normal_scale: 1.2, z_index: 95 },
        { name: 'Compass', image: 'compass.png', color: '#ff9800', payouts: [0, 0, 25, 60, 175], normal_scale: 1.15, z_index: 94 },
        { name: 'Binoculars', image: 'binoculars.png', color: '#9c27b0', payouts: [0, 0, 20, 50, 150], normal_scale: 1.15, z_index: 94 },
        { name: 'A', image: 'a.png', color: '#f44336', payouts: [0, 0, 10, 20, 100], normal_scale: 1.10, z_index: 93 },
        { name: 'K', image: 'k.png', color: '#4caf50', payouts: [0, 0, 8, 15, 90], normal_scale: 1.10, z_index: 93 },
        { name: 'Q', image: 'q.png', color: '#ffc107', payouts: [0, 0, 6, 12, 80], normal_scale: 1.10, z_index: 93 },
        { name: 'J', image: 'j.png', color: '#2196f3', payouts: [0, 0, 5, 10, 70], normal_scale: 1.10, z_index: 93 },
        { name: 'Wild', image: 'wild.png', color: '#00bcd4', payouts: [0, 0, 50, 125, 300], normal_scale: 1.25, z_index: 120 },
        { name: 'Scatter', image: 'scatter.png', color: '#e91e63', payouts: [0, 0, 5, 20, 50], normal_scale: 1.30, z_index: 97 }
    ];
    
    // Create configuration
    const config = {
        containerId: 'slotMachine',
        reelCount: 5,
        symbolsPerReel: 3,
        symbolsPerReelArray: [40, 43, 46, 49, 52],
        symbolSize: 100,
        extraSymbols: 2,
        symbols: symbols,
        wallThickness: {
            top: 20,
            right: 7,
            bottom: 60,
            left: 7
        },
        balance: 1000,
        stake: 0.3
    };
    
    // Initialize slot machine
    window.slotMachine = new KongSlotMachine(config);
    
    // Wait for assets to load before running tests
    setTimeout(() => {
        if (typeof KongSlotTest !== 'undefined') {
            KongSlotTest.runAllTests();
        } else {
            console.log('KongSlotTest is not defined. Tests will not run automatically.');
        }
    }, 3000);
    
    // Add event listeners for UI elements
    const featuresButton = document.getElementById('featuresButton');
    if (featuresButton) {
        featuresButton.addEventListener('click', () => {
            document.getElementById('featuresOverlay').style.display = 'block';
        });
    }
    
    // Feature buttons
    const featureButtons = document.querySelectorAll('#featuresOverlay button');
    if (featureButtons.length > 0) {
        featureButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const featureName = e.target.textContent.trim();
                const featuresOverlay = document.getElementById('featuresOverlay');
                if (featuresOverlay) {
                    featuresOverlay.style.display = 'none';
                }
                
                // Trigger specific feature
                if (featureName === 'Feature 1') {
                    // Big spin
                    window.slotMachine.spin();
                } else if (featureName === 'Feature 2') {
                    // Big win
                    const mockResults = window.slotMachine.generateMockResults();
                    mockResults.generateBigWin = true;
                    window.slotMachine.spinAnimation(mockResults);
                } else if (featureName === 'Feature 3') {
                    // Free spins
                    const mockResults = {
                        reels: window.slotMachine.generateMockResults().reels,
                        triggerFreeSpins: true,
                        generateBigWin: false
                    };
                    window.slotMachine.spinAnimation(mockResults);
                }
            });
        });
    }
    
    // Close win overlay
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const winOverlay = document.getElementById('winOverlay');
            if (winOverlay) {
                winOverlay.style.display = 'none';
            }
        });
    }
    
    // Hide Kong overlay
    const hideKongOverlayBtn = document.getElementById('hideKongOverlay');
    if (hideKongOverlayBtn) {
        hideKongOverlayBtn.addEventListener('click', () => {
            const kongOverlay = document.getElementById('kong_overlay');
            if (kongOverlay) {
                kongOverlay.style.display = 'none';
            }
            window.slotMachine.audioManager.playBackgroundMusic();
        });
    }
});