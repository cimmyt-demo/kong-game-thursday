import { GAME_CONFIG, SYMBOLS, KONG_SYMBOLS } from "./constants.js"

// Reel Manager - Handles the slot machine reels
class ReelManager {
  constructor(app) {
    this.app = app
    this.gameContainer = document.querySelector(".game-canvas-container")
    this.numReels = GAME_CONFIG.numReels
    this.numRows = GAME_CONFIG.numRows
    this.reels = []
    this.reelSymbols = []
    this.currentInterval = null
    this.symbolMultiplierMap = new Map(SYMBOLS.map((s) => [s.name, s.multiplier]))

    // Initialize PIXI application
    this.initPixiApp()

    // Create background
    this.createBackground()

    // Create reels
    this.createReels()

    // Handle window resizing
    window.addEventListener("resize", () => {
      this.app.renderer.resize(this.gameContainer.clientWidth, this.gameContainer.clientHeight)
      this.resizeBackground()
    })

    // Handle orientation change
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.app.renderer.resize(this.gameContainer.clientWidth, this.gameContainer.clientHeight)
        this.resizeBackground()
        this.createReels()
      }, 300) // Delay to allow orientation to complete
    })
  }

  // Initialize PIXI application
  initPixiApp() {
    this.app.renderer.resize(this.gameContainer.clientWidth, this.gameContainer.clientHeight)
  }

  // Create background
  createBackground() {
    this.backgroundTexture = PIXI.Texture.from("nbcg2.png")
    this.backgroundSprite = new PIXI.Sprite(this.backgroundTexture)
    this.resizeBackground()
    this.app.stage.addChild(this.backgroundSprite)
  }

  // Resize background
  resizeBackground() {
    this.backgroundSprite.width = this.app.screen.width
    this.backgroundSprite.height = this.app.screen.height
  }

  // Change background image
  changeBackground(newImagePath) {
    const newTexture = PIXI.Texture.from(newImagePath)
    this.backgroundSprite.texture = newTexture
  }

  // Calculate reel dimensions based on available space
  calculateReelDimensions() {
    const availableWidth = this.app.screen.width
    const availableHeight = this.app.screen.height

    const reelWidth = (availableWidth / this.numReels) * 0.99
    const reelHeight = availableHeight * 0.99

    return { reelWidth, reelHeight }
  }

  // Create reels
  createReels() {
    // Clear existing reels
    this.reels.forEach((reel) => {
      this.app.stage.removeChild(reel)
    })
    this.reels.length = 0
    this.reelSymbols.length = 0

    const { reelWidth, reelHeight } = this.calculateReelDimensions()

    // Create new reels
    for (let i = 0; i < this.numReels; i++) {
      // Create reel container
      const reel = new PIXI.Container()
      reel.x = (this.app.screen.width / this.numReels) * i + (this.app.screen.width / this.numReels - reelWidth) / 2
      reel.y = (this.app.screen.height - reelHeight) / 2

      // Create symbol container
      const symbolContainer = new PIXI.Container()
      reel.addChild(symbolContainer)

      this.reels.push(reel)
      this.reelSymbols.push(symbolContainer)
      this.app.stage.addChild(reel)
    }

    // Populate reels
    this.populateReels()
  }

  // Populate all reels with symbols
  populateReels() {
    for (let i = 0; i < this.numReels; i++) {
      this.populateReel(i)
    }
  }

  // Populate a single reel with symbols
  populateReel(reelIndex) {
    const symbolContainer = this.reelSymbols[reelIndex]
    symbolContainer.removeChildren()

    const { reelWidth, reelHeight } = this.calculateReelDimensions()

    const rowSymbols = []
    for (let j = 0; j < this.numRows; j++) {
      const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      const texture = PIXI.Texture.from(symbol.image)
      const sprite = new PIXI.Sprite(texture)
      sprite.y = j * (reelHeight / this.numRows)
      sprite.x = reelWidth * 0.03 // Add a small margin
      sprite.width = reelWidth * 0.99
      sprite.height = (reelHeight / this.numRows) * 1
      sprite.symbolName = symbol.name
      symbolContainer.addChild(sprite)
      rowSymbols.push(sprite)
    }

    return rowSymbols
  }

  // Display final symbols for a specific reel
  displayFinalSymbolsForReel(reelIndex, reelSymbolNames) {
    const { reelWidth, reelHeight } = this.calculateReelDimensions()
    const symbolContainer = this.reelSymbols[reelIndex]
    symbolContainer.removeChildren()

    // Loop through each row in the reel
    for (let j = 0; j < this.numRows; j++) {
      const symbolName = reelSymbolNames[j]
      const symbolData = KONG_SYMBOLS[symbolName]

      if (symbolData) {
        const texture = PIXI.Texture.from(symbolData.image)
        const sprite = new PIXI.Sprite(texture)
        sprite.y = j * (reelHeight / this.numRows)
        sprite.x = reelWidth * 0.01 // Add a small margin
        sprite.width = reelWidth * 0.96
        sprite.height = (reelHeight / this.numRows) * 1
        sprite.symbolName = symbolName
        sprite.reelIndex = reelIndex
        sprite.rowIndex = j
        symbolContainer.addChild(sprite)
      }
    }
  }

  // Display API symbols
  displayAPISymbols(apiReels) {
    // Loop through each reel
    for (let i = 0; i < this.numReels; i++) {
      this.displayFinalSymbolsForReel(i, apiReels[i])
    }
  }

  // Spin animation
  spinAnimation(callback, apiResult) {
    if (this.currentInterval) clearInterval(this.currentInterval)

    const spinCounts = [15, 20, 25, 30, 35] // Different stop times for each reel
    const remainingSpins = [...spinCounts]

    this.currentInterval = setInterval(() => {
      let allStopped = true

      for (let i = 0; i < this.numReels; i++) {
        if (remainingSpins[i] > 0) {
          // Continue spinning with random symbols until ready to stop
          this.populateReel(i)
          remainingSpins[i]--
          allStopped = false
        } else if (remainingSpins[i] === 0) {
          // When a reel is ready to stop, immediately display the final symbols
          if (apiResult && apiResult.reels && apiResult.reels[i]) {
            this.displayFinalSymbolsForReel(i, apiResult.reels[i])
          }
          remainingSpins[i] = -1 // Mark as completely stopped
        }
      }

      if (allStopped) {
        clearInterval(this.currentInterval)
        this.currentInterval = null

        // Ensure the final display matches exactly what the API returned
        if (apiResult && apiResult.reels) {
          this.displayAPISymbols(apiResult.reels)

          // Highlight winning symbols if there's a win
          if (apiResult.win_amount > 0) {
            this.highlightWinningSymbols(apiResult.reels, apiResult.winning_positions)
          }
        }

        callback()
      }
    }, 100)
  }

  // Group winning symbols by ways
  groupWinValuesDisplay(winningPositions) {
    if (!winningPositions || winningPositions.length === 0) return [];
    
    // Group winning positions by symbol and ways
    const groupedWins = {};
    
    winningPositions.forEach(pos => {
      const key = `${pos.symbol}-${pos.ways}-${pos.count}`;
      if (!groupedWins[key]) {
        groupedWins[key] = {
          symbol: pos.symbol,
          ways: pos.ways,
          count: pos.count,
          win_value: pos.win_value,
          positions: []
        };
      }
      groupedWins[key].positions.push({ reel: pos.reel, row: pos.row });
    });
    
    return Object.values(groupedWins);
  }

  // Highlight winning symbols
  highlightWinningSymbols(apiReels, winningPositions) {
    // If no winning positions are passed, initialize it as an empty array
    winningPositions = winningPositions || []

    console.log("------------Listing winning positions----------------")
    console.log(winningPositions)

    // Define a mapping of symbol names to z-index values
    const symbolZIndexMap = {
      "Treasure Chest": 80,
      Wild: 100,
      Scatter: 90,
      Explorer: 60,
      Compass: 60,
      Binoculars: 70,
      A: 50,
      K: 50,
      Q: 50,
      J: 50,
    }

    // Group winning positions by ways
    const groupedWins = this.groupWinValuesDisplay(winningPositions);
    console.log("Grouped wins:", groupedWins);
    
    // Highlight each group sequentially
    this.animateWinGroups(apiReels, groupedWins, symbolZIndexMap, 0);
  }
  
  // Animate win groups sequentially
  animateWinGroups(apiReels, groupedWins, symbolZIndexMap, groupIndex) {
    if (groupIndex >= groupedWins.length) {
      // Clear win amount display when all groups are done
      const winAmountDisplay = document.getElementById("win-amount2");
      const displayWinAmount = document.getElementById("display_win_amount");
      
      console.log("All win groups finished, hiding win amount display");
      
      if (winAmountDisplay) {
        winAmountDisplay.textContent = "";
        console.log("Cleared win amount text");
      }
      
      if (displayWinAmount) {
        displayWinAmount.style.display = "none";
        console.log("Set display_win_amount to hide");
      }
      return;
    }
    
    const currentGroup = groupedWins[groupIndex];
    console.log(`Highlighting group ${groupIndex + 1}/${groupedWins.length}: ${currentGroup.symbol} x${currentGroup.count}`);
    
    // Determine the dominant row for this winning group
    const rowCounts = [0, 0, 0]; // Count of symbols in each row
    let dominantRow = 1; // Default to middle row
    
    // Count symbols in each row
    console.log(`Analyzing winning positions for group: ${currentGroup.symbol}`);
    console.log(`Positions:`, currentGroup.positions);
    
    currentGroup.positions.forEach(pos => {
      if (pos.row >= 0 && pos.row < 3) {
        rowCounts[pos.row]++;
        console.log(`Symbol at reel ${pos.reel}, row ${pos.row} - increasing count for row ${pos.row} to ${rowCounts[pos.row]}`);
      }
    });
    
    // Find the row with the most symbols
    let maxCount = rowCounts[0];
    dominantRow = 0;
    console.log(`Initial row counts: Top=${rowCounts[0]}, Middle=${rowCounts[1]}, Bottom=${rowCounts[2]}`);
    
    for (let i = 1; i < rowCounts.length; i++) {
      if (rowCounts[i] > maxCount) {
        maxCount = rowCounts[i];
        dominantRow = i;
        console.log(`New dominant row: ${dominantRow} with ${maxCount} symbols`);
      }
    }
    
    console.log(`Final dominant row: ${dominantRow} (${dominantRow === 0 ? "Top" : dominantRow === 1 ? "Middle" : "Bottom"})`)
    
    // Highlight all positions in this group
    for (let i = 0; i < this.numReels; i++) {
      const symbolContainer = this.reelSymbols[i]; // Container for current reel symbols

      // Loop through each symbol in this reel
      for (let j = 0; j < symbolContainer.children.length; j++) {
        const sprite = symbolContainer.children[j]; // Visual representation (sprite)
        const currentSymbolName = apiReels[i][j]; // Symbol name from API

        // Check if this symbol is in the current group
        const isInCurrentGroup = currentGroup.positions.some(
          pos => pos.reel === i && pos.row === j
        );

        if (isInCurrentGroup) {
          this.animateSymbol(sprite, currentSymbolName, symbolZIndexMap);
        }
      }
    }
    
    // Show win value for this group in the overlay
    const winAmountDisplay = document.getElementById("win-amount2");
    const displayWinAmount = document.getElementById("display_win_amount");
    
    console.log(`Setting up win display - Display elements found:`, 
                `winAmountDisplay=${!!winAmountDisplay}`, 
                `displayWinAmount=${!!displayWinAmount}`);
    
    if (winAmountDisplay && displayWinAmount) {
      // Show the win amount overlay
      displayWinAmount.style.display = "block";
      
      // Position the win text absolutely based on dominant row
      console.log(`Positioning win display for row ${dominantRow}`);
      
      // Clear any previous styles
      winAmountDisplay.style.position = "absolute";
      winAmountDisplay.style.left = "50%";
      winAmountDisplay.style.transform = "translateX(-50%)";
      
      // Set vertical position based on dominant row
      let topPosition;
      if (dominantRow === 0) {
        // Top row
        topPosition = "15%";
        console.log(`Setting top position to ${topPosition} for top row`);
      } else if (dominantRow === 1) {
        // Middle row
        topPosition = "45%";
        console.log(`Setting top position to ${topPosition} for middle row`);
      } else {
        // Bottom row
        topPosition = "75%";
        console.log(`Setting top position to ${topPosition} for bottom row`);
      }
      
      // Apply the position directly to the element
      winAmountDisplay.style.top = topPosition;
      
      // Display win amount and symbol information
      const displayText = `${currentGroup.symbol} x${currentGroup.count} = $${currentGroup.win_value.toFixed(2)}`;
      winAmountDisplay.textContent = displayText;
      console.log(`Setting win text to: "${displayText}"`);
      
      // Add some visual effects
      winAmountDisplay.classList.add("win-flash");
      setTimeout(() => {
        winAmountDisplay.classList.remove("win-flash");
      }, 1000);
      
      // Verify the element is visible and positioned correctly
      console.log(`Win display element styles:`, 
                  `display=${displayWinAmount.style.display}`,
                  `position=${winAmountDisplay.style.position}`,
                  `top=${winAmountDisplay.style.top}`,
                  `left=${winAmountDisplay.style.left}`);
    }
    
    console.log(`Win amount for group: $${currentGroup.win_value} (Row: ${dominantRow})`);
    
    // Move to the next group after a delay
    setTimeout(() => {
      this.animateWinGroups(apiReels, groupedWins, symbolZIndexMap, groupIndex + 1);
    }, 1500); // Wait 1.5 seconds before showing the next win group
  }
  
  // Animate a single symbol
  animateSymbol(sprite, symbolName, symbolZIndexMap) {
    // Reset visual styles
    sprite.filters = [];
    sprite.visible = true;
    sprite.alpha = 1;
    sprite.tint = 0xffffff;
    sprite.rotation = 0;

    // Assign zIndex based on the symbol name from the mapping
    sprite.zIndex = symbolZIndexMap[symbolName] || 0; // Default to 0 if not found in map

    // Store original values for later reset
    const originalX = sprite.x;
    const originalY = sprite.y;
    const originalScale = { x: sprite.scale.x, y: sprite.scale.y };
    const originalTexture = sprite.texture;

    // Define the maximum scale increase
    const maxScaleX = originalScale.x * 1.2;
    const maxScaleY = originalScale.y * 1.2;

    let animationTicker;

    switch (symbolName) {
      case "Treasure Chest":
        animationTicker = () => {
          sprite.visible = Math.floor(Date.now() / 100) % 2 === 0;
          sprite.scale.set(maxScaleX, maxScaleY);
        };
        break;

      case "Wild":
        const blinkTexture = PIXI.Texture.from("wild3.gif");
        animationTicker = () => {
          sprite.texture = Math.floor(Date.now() / 850) % 2 === 0 ? blinkTexture : originalTexture;
          sprite.scale.set(maxScaleX, maxScaleY);
        };
        break;

      case "Scatter":
        animationTicker = () => {
          sprite.alpha = 0.5 + 0.5 * Math.sin(Date.now() / 200);
          sprite.scale.set(maxScaleX, maxScaleY);
        };
        break;

      case "Explorer":
        animationTicker = () => {
          sprite.visible = Math.floor(Date.now() / 450) % 2 === 0;
          sprite.scale.set(maxScaleX, maxScaleY);
        };
        break;

      case "Compass":
      case "Binoculars":
        animationTicker = () => {
          sprite.x = originalX + Math.sin(Date.now() / 80) * 4;
          sprite.scale.set(maxScaleX, maxScaleY);
        };
        break;

      case "A":
      case "K":
      case "Q":
      case "J":
        animationTicker = () => {
          sprite.visible = Math.floor(Date.now() / 450) % 2 === 0;
          sprite.scale.set(maxScaleX, maxScaleY);
        };
        break;

      default:
        const blinkTexture2 = PIXI.Texture.from("explorer_blink.gif");
        animationTicker = () => {
          sprite.texture = Math.floor(Date.now() / 300) % 2 === 0 ? blinkTexture2 : originalTexture;
          sprite.scale.set(maxScaleX, maxScaleY);
        };
    }

    // Start the animation
    const tickerRef = this.app.ticker.add(animationTicker);
    sprite._tickerRef = tickerRef;

    // Stop animation after 1.2 seconds and reset everything
    setTimeout(() => {
      if (this.app.ticker && sprite._tickerRef) {
        this.app.ticker.remove(sprite._tickerRef);
      }

      sprite.visible = true;
      sprite.alpha = 1;
      sprite.tint = 0xffffff;
      sprite.scale.set(originalScale.x, originalScale.y);
      sprite.rotation = 0;
      sprite.texture = originalTexture;
      sprite.x = originalX;
      sprite.y = originalY;

      // Reset zIndex to ensure it doesn't affect other symbols
      sprite.zIndex = 0;

      delete sprite._tickerRef;
    }, 1200); // Reduced from 3000 to allow for sequential group animations
  }
}

export default ReelManager
