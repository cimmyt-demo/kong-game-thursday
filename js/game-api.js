import { API_CONFIG } from "./constants.js"

// Game API - Handles communication with the backend
class GameAPI {
  constructor() {
    this.API_BASE_URL = API_CONFIG.baseUrl
    this.API_ENDPOINT = API_CONFIG.endpoint
    this.clientId = API_CONFIG.clientId
    this.gameId = API_CONFIG.gameId
    this.playerId = API_CONFIG.playerId
  }

  // Spin the Kong game
  async spinKongGame(params) {
    try {
      console.log(JSON.stringify(params))

      const response = await fetch(`${this.API_BASE_URL}${this.API_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text()
        console.error(`API error (${response.status}): ${errorText}`)
        throw new Error(`API error (${response.status}): ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.log("------------------------")
      console.error("Error calling Kong API:", error)

      // Fallback to mock response if API call fails
      return this.generateMockResponse(params)
    }
  }

  // Generate mock response for fallback
  generateMockResponse(params) {
    // Define symbol keys for random generation
    const symbolKeys = ["Treasure Chest", "Explorer", "Compass", "Binoculars", "A", "K", "Q", "J", "Wild", "Scatter"]

    // Generate random reels
    const reels = []
    for (let i = 0; i < 5; i++) {
      const reel = []
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * symbolKeys.length * 0.8)
        const symbol = symbolKeys[Math.min(randomIndex, symbolKeys.length - 1)]
        reel.push(symbol)
      }
      reels.push(reel)
    }

    // Determine if free spins are triggered (rare event - 5% chance)
    const freeSpinTriggered = params.is_free_spin ? false : Math.random() < 0.05

    // Calculate win amount (simplified logic for demo)
    let winAmount = 0
    let bonusMultiplier = params.bonus_multiplier
    let freeSpinCount = params.free_spin_count

    // Check for winning combinations
    const hasWin = Math.random() < 0.3 // 30% chance of winning

    if (hasWin) {
      // Calculate a random win amount based on bet
      const betAmount = params.is_free_spin ? params.original_bet_amount : params.bet_amount
      const multiplier = Math.floor(Math.random() * 10) + 1 // 1-10x multiplier
      winAmount = betAmount * multiplier

      // Apply bonus multiplier in free spin mode
      if (params.is_free_spin && params.bonus_multiplier > 0) {
        winAmount *= params.bonus_multiplier
      }
    }

    // Handle free spins logic
    if (freeSpinTriggered) {
      freeSpinCount = 13 // Initial free spins award

      // Determine bonus multiplier based on scatter count (simplified)
      const scatterCount = Math.floor(Math.random() * 3) + 5 // 5-7 scatters

      if (scatterCount === 5) bonusMultiplier = 3
      else if (scatterCount === 6) bonusMultiplier = 6
      else if (scatterCount === 7) bonusMultiplier = 9
      else if (scatterCount === 8) bonusMultiplier = 18
      else if (scatterCount === 9) bonusMultiplier = 36
      else bonusMultiplier = 72
    } else if (params.is_free_spin) {
      // Decrement free spin count
      freeSpinCount = Math.max(0, params.free_spin_count - 1)
    }

    // Generate winning positions (simplified)
    const winningPositions = []
    if (hasWin) {
      // Add some random winning positions
      const winSymbol = reels[0][0] // Just use the first symbol as an example
      winningPositions.push({ symbol: winSymbol, reel: 0, row: 0 })
      winningPositions.push({ symbol: winSymbol, reel: 1, row: 0 })
      winningPositions.push({ symbol: winSymbol, reel: 2, row: 0 })
    }

    return {
      status: "success",
      message: "",
      reels: reels,
      win_amount: winAmount,
      is_free_spin: freeSpinCount > 0,
      free_spin_count: freeSpinCount,
      bonus_multiplier: bonusMultiplier,
      free_spin_triggered: freeSpinTriggered,
      winning_positions: winningPositions,
    }
  }
}

export default GameAPI
