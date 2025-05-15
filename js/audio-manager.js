// Audio Manager - Handles all game audio
class AudioManager {
    constructor() {
      // Sound effects
      this.spinSound = new Audio()
      this.spinSound.src = "spin.mp3"
      this.spinSound.preload = "auto"
  
      this.winSound = new Audio()
      this.winSound.src = "win.mp3"
      this.winSound.preload = "auto"
  
      // Background music
      this.backgroundMusic = new Audio()
      this.backgroundMusic.src = "gameaudio.mp3"
      this.backgroundMusic.loop = true
      this.backgroundMusic.volume = 0.5
      this.backgroundMusic.preload = "auto"
  
      // Sound control variables
      this.soundEffectsEnabled = true
      this.backgroundMusicEnabled = true
      this.tempSoundEffectsEnabled = true
      this.tempBackgroundMusicEnabled = true
    }
  
    // Play spin sound
    playSpinSound() {
      if (this.soundEffectsEnabled && this.spinSound) {
        this.spinSound.play().catch((e) => console.log("Audio play failed:", e))
      }
    }
  
    // Play win sound
    playWinSound() {
      if (this.soundEffectsEnabled && this.winSound) {
        this.winSound.play().catch((e) => console.log("Audio play failed:", e))
      }
    }
  
    // Play background music
    playBackgroundMusic() {
      if (this.backgroundMusicEnabled && this.backgroundMusic) {
        this.backgroundMusic.play().catch((e) => console.log("Audio play failed:", e))
      }
    }
  
    // Pause background music
    pauseBackgroundMusic() {
      if (this.backgroundMusic) {
        this.backgroundMusic.pause()
      }
    }
  
    // Toggle sound effects
    toggleSoundEffects() {
      this.tempSoundEffectsEnabled = !this.tempSoundEffectsEnabled
      return this.tempSoundEffectsEnabled
    }
  
    // Toggle background music
    toggleBackgroundMusic() {
      this.tempBackgroundMusicEnabled = !this.tempBackgroundMusicEnabled
      return this.tempBackgroundMusicEnabled
    }
  
    // Apply temporary settings
    applySettings() {
      this.soundEffectsEnabled = this.tempSoundEffectsEnabled
      this.backgroundMusicEnabled = this.tempBackgroundMusicEnabled
  
      if (this.backgroundMusicEnabled) {
        this.playBackgroundMusic()
      } else {
        this.pauseBackgroundMusic()
      }
    }
  
    // Reset temporary settings to current settings
    resetTempSettings() {
      this.tempSoundEffectsEnabled = this.soundEffectsEnabled
      this.tempBackgroundMusicEnabled = this.backgroundMusicEnabled
    }
  }
  
  export default AudioManager
  