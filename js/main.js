// Import necessary modules
import { preloadImages } from "./utils.js"
import { COIN_IMAGES } from "./constants.js"
import GameManager from "./game-manager.js"
import { updateLoaderProgress } from "./utils.js"

// Main entry point for the game
document.addEventListener("DOMContentLoaded", () => {
  // Check device width for overlay
  if (window.innerWidth <= 900) {
    document.getElementById("device_overlay").style.display = "none"
  }

  // Preload coin images
  preloadImages(COIN_IMAGES)

  // Initialize the game manager
  const gameManager = new GameManager()
  window.gameManager = gameManager

  // Start the loader animation
  updateLoaderProgress()

  // Set up win animation global access
  window.showWinAnimation = (amount) => {
    gameManager.winAnimationManager.showWinAnimation(amount)
  }

  window.closeWinAnimation = () => {
    gameManager.winAnimationManager.closeWinAnimation()
  }

  // Set up Kong overlay global access
  window.hideKongOverlay = () => {
    gameManager.hideKongOverlay()
  }
})
