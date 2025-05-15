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

    // Loop through each reel
    for (let i = 0; i < this.numReels; i++) {
      const symbolContainer = this.reelSymbols[i] // Container for current reel symbols

      // Loop through each symbol (child sprite) in this reel
      for (let j = 0; j < symbolContainer.children.length; j++) {
        const sprite = symbolContainer.children[j] // Visual representation (sprite)
        const currentSymbolName = apiReels[i][j] // Symbol name from API

        // Check if this symbol is in the list of winning positions
        const isWinning = winningPositions.some(
          (pos) => pos.symbol === currentSymbolName && pos.reel === i && pos.row === j,
        )

        console.log("------------nice--------------------")
        console.log(isWinning)

        if (isWinning) {
          // Reset visual styles
          sprite.filters = []
          sprite.visible = true
          sprite.alpha = 1
          sprite.tint = 0xffffff
          sprite.rotation = 0

          // Assign zIndex based on the symbol name from the mapping
          sprite.zIndex = symbolZIndexMap[currentSymbolName] || 0 // Default to 0 if not found in map

          // Store original values for later reset
          const originalX = sprite.x
          const originalY = sprite.y
          const originalScale = { x: sprite.scale.x, y: sprite.scale.y }
          const originalTexture = sprite.texture

          // Define the maximum scale increase (20%)
          const maxScaleX = originalScale.x * 1.0
          const maxScaleY = originalScale.y * 1.0

          let animationTicker

          switch (currentSymbolName) {
            case "Treasure Chest":
              animationTicker = () => {
                sprite.visible = Math.floor(Date.now() / 100) % 2 === 0
                sprite.scale.set(maxScaleX, maxScaleY)
              }
              break

            case "Wild":
              const blinkTexture = PIXI.Texture.from("wild3.gif")
              animationTicker = () => {
                sprite.texture = Math.floor(Date.now() / 850) % 2 === 0 ? blinkTexture : originalTexture
                sprite.scale.set(originalScale.x, originalScale.y)
              }
              break

            case "Scatter":
              animationTicker = () => {
                sprite.alpha = 0.5 + 0.5 * Math.sin(Date.now() / 200)
                sprite.scale.set(maxScaleX, maxScaleY)
              }
              break

            case "Explorer":
              animationTicker = () => {
                sprite.visible = Math.floor(Date.now() / 450) % 2 === 0
                sprite.scale.set(maxScaleX, maxScaleY)
              }
              break

            case "Compass":
            case "Binoculars":
              animationTicker = () => {
                sprite.x = originalX + Math.sin(Date.now() / 80) * 4
                sprite.scale.set(maxScaleX, maxScaleY)
              }
              break

            case "A":
            case "K":
            case "Q":
            case "J":
              animationTicker = () => {
                sprite.visible = Math.floor(Date.now() / 450) % 2 === 0
                sprite.scale.set(maxScaleX, maxScaleY)
              }
              break

            default:
              const blinkTexture2 = PIXI.Texture.from("explorer_blink.gif")
              animationTicker = () => {
                sprite.texture = Math.floor(Date.now() / 300) % 2 === 0 ? blinkTexture2 : originalTexture
                sprite.scale.set(originalScale.x, originalScale.y)
              }
          }

          // Start the animation
          const tickerRef = this.app.ticker.add(animationTicker)
          sprite._tickerRef = tickerRef

          // Stop animation after 3 seconds and reset everything
          setTimeout(() => {
            if (this.app.ticker && sprite._tickerRef) {
              this.app.ticker.remove(sprite._tickerRef)
            }

            sprite.visible = true
            sprite.alpha = 1
            sprite.tint = 0xffffff
            sprite.scale.set(originalScale.x, originalScale.y)
            sprite.rotation = 0
            sprite.texture = originalTexture
            sprite.x = originalX
            sprite.y = originalY

            // Reset zIndex to ensure it doesn't affect other symbols
            sprite.zIndex = 0

            delete sprite._tickerRef
          }, 3000)
        }
      }
    }
  }
}

export default ReelManager
