import { preloadImages, getWinLevel } from "./utils.js"
import { COIN_IMAGES, WIN_LEVELS } from "./constants.js"

// Win Animation Manager - Handles big win animations
class WinAnimationManager {
  constructor() {
    this.winOverlay = document.getElementById("winOverlay")
    this.winText = document.getElementById("winText")
    this.winImg = document.getElementById("winImg")
    this.winAmount = document.getElementById("winAmount")
    this.sunburst = document.getElementById("sunburst")
    this.coinsContainer = document.getElementById("coinsContainer")
    this.closeBtn = document.getElementById("closeBtn")

    // Preload coin images
    preloadImages(COIN_IMAGES)

    // Set up event listeners
    this.closeBtn.addEventListener("click", () => this.closeWinAnimation())
    this.winOverlay.addEventListener("click", (e) => {
      if (e.target === this.winOverlay) {
        this.closeWinAnimation()
      }
    })
  }

  // Show the win animation
  showWinAnimation(amount) {
    // Reset any existing animations
    clearTimeout(window.autoCloseTimeout)

    // Set initial win level
    let currentLevel = "big"
    this.updateWinLevel(currentLevel)

    // Show the overlay
    this.winOverlay.style.display = "flex"

    // Start with $0
    let currentAmount = 0
    this.winAmount.textContent = "$" + currentAmount.toLocaleString()

    // Create the coin fountain
    setTimeout(() => {
      this.createCoinFountain(WIN_LEVELS[currentLevel].coinCount)
    }, 100)

    // Animate the counter
    const duration = 10000 // 10 seconds for the counter
    const fps = 60
    const startTime = performance.now()

    const updateCounter = (timestamp) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      currentAmount = progress * amount
      this.winAmount.textContent = "$" + Math.floor(currentAmount).toLocaleString()

      // Check if we need to upgrade the win level
      const newLevel = getWinLevel(currentAmount)
      if (newLevel !== currentLevel) {
        currentLevel = newLevel
        this.updateWinLevel(currentLevel)

        // Add more coins for the new level
        this.createCoinFountain(WIN_LEVELS[currentLevel].coinCount)
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      } else {
        // Counter finished
        this.winAmount.textContent = "$" + amount.toLocaleString()

        // Auto close after 3 seconds
        window.autoCloseTimeout = setTimeout(() => {
          this.closeWinAnimation()
        }, 3000)
      }
    }

    requestAnimationFrame(updateCounter)
  }

  // Update the win level visuals
  updateWinLevel(level) {
    // Remove all classes
    this.winText.classList.remove("big-win", "mega-win", "ultra-win")
    this.sunburst.classList.remove("big-win-color", "mega-win-color", "ultra-win-color")

    // Add new classes
    this.winText.classList.add(WIN_LEVELS[level].textClass)
    this.sunburst.classList.add(WIN_LEVELS[level].sunburstClass)

    this.winImg.style.transform = "scale(0.8)"
    setTimeout(() => {
      this.winImg.src = WIN_LEVELS[level].imgSrc
      this.winImg.style.transform = "scale(1.2)"
      setTimeout(() => {
        this.winImg.style.transform = "scale(1)"
      }, 150)
    }, 150)
  }

  // Close the win animation
  closeWinAnimation() {
    this.winOverlay.style.display = "none"
    clearTimeout(window.autoCloseTimeout)

    // Clear all coins
    this.coinsContainer.innerHTML = ""
  }

  // Create the coin fountain with 3D rotating coins
  createCoinFountain(numberOfCoins) {
    // Create fountain of coins
    const containerWidth = this.coinsContainer.offsetWidth
    const containerHeight = this.coinsContainer.offsetHeight

    // Center bottom position
    const centerX = containerWidth / 2

    // Adjust coin count based on screen size
    const isMobile = window.innerWidth < 576
    const actualCoinCount = isMobile ? Math.floor(numberOfCoins * 0.6) : numberOfCoins

    for (let i = 0; i < actualCoinCount; i++) {
      setTimeout(() => {
        // Create coin container element
        const coin = document.createElement("div")
        coin.className = "coin"

        // Random size between 10-30px on mobile, 20-40px on desktop
        const minSize = isMobile ? 15 : 25
        const maxSizeRange = isMobile ? 25 : 25
        const coinSize = Math.floor(Math.random() * maxSizeRange) + minSize
        coin.style.width = `${coinSize}px`
        coin.style.height = `${coinSize}px`

        // Create the img element inside the coin div
        const coinImg = document.createElement("img")
        coinImg.src = COIN_IMAGES[0] // Start with the first image
        coinImg.style.width = "100%"
        coinImg.style.height = "100%"
        coinImg.crossOrigin = "anonymous" // Avoid CORS issues
        coin.appendChild(coinImg)

        // Start at center bottom with slight random offset
        const startX = centerX + (Math.random() - 0.5) * 50
        coin.style.left = `${startX}px`
        coin.style.bottom = "0px"

        // Add to container
        this.coinsContainer.appendChild(coin)

        // Animate the coin in a fountain pattern with 3D rotation
        this.animateCoinFountain(coin, coinImg, startX, containerHeight)
      }, i * 70) // Stagger the coin creation
    }
  }

  // Animate a single coin in a fountain pattern with 3D rotation
  animateCoinFountain(coin, coinImg, startX, containerHeight) {
    const containerWidth = this.coinsContainer.offsetWidth

    // Adjust physics based on screen size
    const isMobile = window.innerWidth < 576
    const velocityMultiplier = isMobile ? 0.8 : 1

    // Random angle for the fountain spread (narrower at the bottom, wider at the top)
    const angle = ((Math.random() - 0.5) * Math.PI) / 2 // -45 to +45 degrees

    // Random initial velocity (speed)
    const initialVelocity = (15 + Math.random() * 10) * velocityMultiplier

    // Calculate velocity components
    const vx = initialVelocity * Math.sin(angle)
    const vy = initialVelocity * Math.cos(angle)

    // Animation parameters
    const gravity = 0.5 * velocityMultiplier
    const duration = 2000 + Math.random() * 1000
    const fps = 60
    const totalFrames = (duration / 1000) * fps

    // Animation variables
    let currentFrame = 0
    let x = startX
    let y = 0
    let velocityY = vy

    // 3D rotation variables
    let currentImageIndex = 0
    const rotationSpeed = (0.1 + Math.random() * 0.2) * velocityMultiplier // Random rotation speed

    // Animation function
    const animate = () => {
      if (!coin.parentNode) return // Stop if coin was removed

      // Update position with gravity
      x += vx
      velocityY -= gravity
      y += velocityY

      // Update coin position
      coin.style.left = `${x}px`
      coin.style.bottom = `${y}px`

      // Update 3D rotation - change the image based on the current frame
      currentImageIndex = (currentImageIndex + rotationSpeed) % COIN_IMAGES.length
      coinImg.src = COIN_IMAGES[Math.floor(currentImageIndex)]

      // Add perspective tilt based on movement direction
      const tiltX = vx * 2 // Tilt based on horizontal velocity
      const tiltY = velocityY // Tilt based on vertical velocity
      coin.style.transform = `perspective(500px) rotateX(${tiltY}deg) rotateY(${tiltX}deg)`

      // Adjust shadow based on height
      const shadowBlur = Math.min(5 + y / 20, 15)
      coin.style.filter = `drop-shadow(0 0 ${shadowBlur}px rgba(255, 215, 0, 0.7))`

      // Check if coin is still visible
      if (y < -100 || x < -100 || x > containerWidth + 100) {
        if (coin.parentNode) {
          coin.parentNode.removeChild(coin)
        }
        return
      }

      // Continue animation
      currentFrame++
      if (currentFrame < totalFrames) {
        requestAnimationFrame(animate)
      } else {
        // Remove coin after animation completes
        if (coin.parentNode) {
          coin.parentNode.removeChild(coin)
        }
      }
    }

    // Start animation
    requestAnimationFrame(animate)
  }
}

export default WinAnimationManager
