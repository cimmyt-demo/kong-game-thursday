// UI Manager - Handles user interface interactions
class UIManager {
    constructor(gameManager) {
      this.gameManager = gameManager
  
      // UI elements
      this.spinButton = document.getElementById("spinButton")
      this.autoPlayButton = document.getElementById("autoPlayButton")
      this.stakeButton = document.getElementById("stakeButton")
      this.settingsButton = document.getElementById("settingsButton")
      this.balanceText = document.getElementById("balanceText")
      this.currentStakeElement = document.getElementById("currentStake")
      this.remainingAutoSpins = document.getElementById("remainingAutoSpins")
      this.spinButtonInnerImage = document.getElementById("spin_img")
      this.winMessageElement = document.getElementById("win-message")
      this.winAmountElement = document.getElementById("win-amount")
      this.freeSpinsIndicator = document.getElementById("free-spins-indicator")
      this.freeSpinsCountElement = document.getElementById("free-spins-count")
      this.bonusMultiplierElement = document.getElementById("bonus-multiplier")
  
      // Overlay elements
      this.stakeOverlay = document.getElementById("stakeOverlay")
      this.autoSpinOverlay = document.getElementById("autoSpinOverlay")
      this.settingsOverlay = document.getElementById("settingsOverlay")
  
      // Options elements
      this.stakeOptions = document.getElementById("stakeOptions")
      this.autoSpinOptions = document.getElementById("autoSpinOptions")
      this.soundEffectsOption = document.getElementById("soundEffectsOption")
      this.backgroundMusicOption = document.getElementById("backgroundMusicOption")
      this.soundEffectsIcon = document.getElementById("soundEffectsIcon")
      this.backgroundMusicIcon = document.getElementById("backgroundMusicIcon")
  
      // Button elements
      this.cancelStakeButton = document.getElementById("cancelStake")
      this.confirmStakeButton = document.getElementById("confirmStake")
      this.cancelAutoSpinButton = document.getElementById("cancelAutoSpin")
      this.confirmAutoSpinButton = document.getElementById("confirmAutoSpin")
      this.cancelSettingsButton = document.getElementById("cancelSettings")
      this.confirmSettingsButton = document.getElementById("confirmSettings")
  
      // Free spins display elements
      this.freeSpinsDisplay = document.getElementById("freespins_display")
      this.normalSpinsDisplay = document.getElementById("normalspins_display")
      this.remainingFsHolder = document.getElementById("remaining_fs_holder")
      this.totalFsHolder = document.getElementById("total_fs_holder")
  
      // Initialize event listeners
      this.initEventListeners()
    }
  
    // Initialize event listeners
    initEventListeners() {
      // Spin button
      this.spinButton.addEventListener("click", () => this.gameManager.spin())
  
      // Auto play button
      this.autoPlayButton.addEventListener("click", () => {
        if (!this.gameManager.spinning && !this.gameManager.isFreeSpinMode) {
          if (this.gameManager.autoSpins > 0) {
            // Cancel auto spins
            this.gameManager.autoSpins = 0
            this.updateAutoSpinsDisplay()
          } else {
            this.autoSpinOverlay.style.display = "block"
  
            // Highlight the currently selected auto spins
            const autoSpinOptionButtons = this.autoSpinOptions.querySelectorAll(".option-button")
            autoSpinOptionButtons.forEach((button) => {
              const value = Number.parseInt(button.dataset.value)
              if (value === this.gameManager.selectedAutoSpins) {
                button.classList.add("selected")
              } else {
                button.classList.remove("selected")
              }
            })
          }
        }
      })
  
      // Stake button
      this.stakeButton.addEventListener("click", () => {
        if (!this.gameManager.spinning && !this.gameManager.isFreeSpinMode) {
          this.stakeOverlay.style.display = "block"
  
          // Highlight the currently selected stake
          const stakeOptionButtons = this.stakeOptions.querySelectorAll(".option-button")
          stakeOptionButtons.forEach((button) => {
            const value = Number.parseFloat(button.dataset.value)
            if (value === this.gameManager.stake) {
              button.classList.add("selected")
            } else {
              button.classList.remove("selected")
            }
          })
        }
      })
  
      // Settings button
      this.settingsButton.addEventListener("click", () => {
        // Store current settings temporarily in case user cancels
        this.gameManager.audioManager.resetTempSettings()
  
        this.settingsOverlay.style.display = "block"
  
        // Update the display to match current settings
        this.updateSoundOptionStyling(
          this.soundEffectsOption,
          this.soundEffectsIcon,
          this.gameManager.audioManager.soundEffectsEnabled,
        )
        this.updateSoundOptionStyling(
          this.backgroundMusicOption,
          this.backgroundMusicIcon,
          this.gameManager.audioManager.backgroundMusicEnabled,
        )
      })
  
      // Sound effects option
      this.soundEffectsOption.addEventListener("click", () => {
        const enabled = this.gameManager.audioManager.toggleSoundEffects()
        this.updateSoundOptionStyling(this.soundEffectsOption, this.soundEffectsIcon, enabled)
      })
  
      // Background music option
      this.backgroundMusicOption.addEventListener("click", () => {
        const enabled = this.gameManager.audioManager.toggleBackgroundMusic()
        this.updateSoundOptionStyling(this.backgroundMusicOption, this.backgroundMusicIcon, enabled)
      })
  
      // Cancel settings
      this.cancelSettingsButton.addEventListener("click", () => {
        this.settingsOverlay.style.display = "none"
        // Revert to previous settings (don't apply changes)
      })
  
      // Confirm settings
      this.confirmSettingsButton.addEventListener("click", () => {
        // Apply the temporary settings
        this.gameManager.audioManager.applySettings()
        this.settingsOverlay.style.display = "none"
      })
  
      // Handle stake option selection
      this.stakeOptions.addEventListener("click", (e) => {
        if (e.target.classList.contains("option-button")) {
          // Remove selected class from all options
          const options = this.stakeOptions.querySelectorAll(".option-button")
          options.forEach((option) => option.classList.remove("selected"))
  
          // Add selected class to clicked option
          e.target.classList.add("selected")
  
          // Update selected stake value
          this.gameManager.selectedStake = Number.parseFloat(e.target.dataset.value)
        }
      })
  
      // Handle auto spin option selection
      this.autoSpinOptions.addEventListener("click", (e) => {
        if (e.target.classList.contains("option-button")) {
          // Remove selected class from all options
          const options = this.autoSpinOptions.querySelectorAll(".option-button")
          options.forEach((option) => option.classList.remove("selected"))
  
          // Add selected class to clicked option
          e.target.classList.add("selected")
  
          // Update selected auto spins value
          this.gameManager.selectedAutoSpins = Number.parseInt(e.target.dataset.value)
        }
      })
  
      // Cancel stake selection
      this.cancelStakeButton.addEventListener("click", () => {
        this.stakeOverlay.style.display = "none"
        // Don't update the stake value
      })
  
      // Confirm stake selection
      this.confirmStakeButton.addEventListener("click", () => {
        this.gameManager.stake = this.gameManager.selectedStake
        this.currentStakeElement.textContent = this.gameManager.stake.toFixed(1)
        this.stakeOverlay.style.display = "none"
      })
  
      // Cancel auto spin selection
      this.cancelAutoSpinButton.addEventListener("click", () => {
        this.autoSpinOverlay.style.display = "none"
        // Don't update the auto spins value
      })
  
      // Confirm auto spin selection and start auto play
      this.confirmAutoSpinButton.addEventListener("click", () => {
        if (this.gameManager.selectedAutoSpins > 0) {
          this.gameManager.autoSpins = this.gameManager.selectedAutoSpins
          this.updateAutoSpinsDisplay()
          this.autoSpinOverlay.style.display = "none"
          this.gameManager.spin()
        }
      })
    }
  
    // Update sound option styling
    updateSoundOptionStyling(option, icon, enabled) {
      if (enabled) {
        option.classList.add("selected")
        icon.textContent = "🔊"
      } else {
        option.classList.remove("selected")
        icon.textContent = "🔇"
      }
    }
  
    // Update balance display
    updateBalanceDisplay() {
      this.balanceText.textContent = this.gameManager.balance.toFixed(2)
    }
  
    // Update stake display
    updateStakeDisplay() {
      this.currentStakeElement.textContent = this.gameManager.stake.toFixed(1)
    }
  
    // Update auto spins display
    updateAutoSpinsDisplay() {
      if (this.gameManager.autoSpins > 0) {
        this.remainingAutoSpins.innerHTML = `${this.gameManager.autoSpins}`
      } else {
        this.remainingAutoSpins.innerHTML = ""
      }
    }
  
    // Show win message
    showWinMessage(amount, multiplier) {
      if (amount >= 5) {
        this.gameManager.winAnimationManager.showWinAnimation(amount)
      }
  
      // Hide win message after a delay
      setTimeout(() => {
        this.winMessageElement.style.display = "none"
      }, 3000)
    }
  
    // Update free spins display
    updateFreeSpinsDisplay(freeSpinCount, totalFreeSpins) {
      this.freeSpinsCountElement.textContent = freeSpinCount
      this.remainingFsHolder.innerHTML = freeSpinCount
      this.totalFsHolder.innerHTML = totalFreeSpins
    }
  
    // Show free spins mode
    showFreeSpinsMode() {
      this.freeSpinsDisplay.style.display = "flex"
      this.normalSpinsDisplay.style.display = "none"
      this.freeSpinsIndicator.style.display = "block"
    }
  
    // Hide free spins mode
    hideFreeSpinsMode() {
      this.freeSpinsDisplay.style.display = "none"
      this.normalSpinsDisplay.style.display = "flex"
      this.freeSpinsIndicator.style.display = "none"
    }
  
    // Update bonus multiplier display
    updateBonusMultiplierDisplay(multiplier) {
      this.bonusMultiplierElement.textContent = multiplier
    }
  
    // Rotate spin button image
    rotateSpinButtonImage() {
      this.spinButtonInnerImage.style.transition = "transform 0.5s ease"
      this.spinButtonInnerImage.style.transform = "rotate(180deg)"
    }
  
    // Reset spin button image
    resetSpinButtonImage() {
      this.spinButtonInnerImage.style.transition = "transform 0.5s ease"
      this.spinButtonInnerImage.style.transform = "rotate(360deg)"
    }
  }
  
  export default UIManager
  