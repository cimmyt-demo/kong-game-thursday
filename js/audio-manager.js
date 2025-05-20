// Audio Manager - Handles all game audio
class AudioManager {
    constructor() {
      // Audio objects
      this.sounds = {
        // Sound effects from the sounds directory
        spin: this.createSound("sounds/SE_ReelSpeedUp.mp3", false, 1.0),
        win: this.createSound("sounds/SE_Scoring_01.mp3", false, 1.0),
        spinStop: this.createSound("sounds/SE_Spinstop.mp3", false, 1.0),
        buttonPress: this.createSound("sounds/SE_ButtonPress.mp3", false, 1.0),
        bigWin: this.createSound("sounds/SE_BigWin.mp3", false, 1.0),
        megaWin: this.createSound("sounds/SE_MegaWin.mp3", false, 1.0),
        ultraWin: this.createSound("sounds/SE_UltraWin.mp3", false, 1.0),
        bonus: this.createSound("sounds/SE_BonusAlarm.mp3", false, 1.0),
      };
      
      // Background music
      this.backgroundMusic = this.createSound("sounds/SE_Base_BG.mp3", true, 0.5);
      
      // Sound control variables
      this.soundEffectsEnabled = true;
      this.backgroundMusicEnabled = true;
      this.tempSoundEffectsEnabled = true;
      this.tempBackgroundMusicEnabled = true;
      
      // Preload all sounds to ensure they're ready
      this.preloadAllSounds();
    }
    
    // Create a sound with the given properties
    createSound(src, loop = false, volume = 1.0) {
      const sound = new Audio();
      sound.src = src;
      sound.preload = "auto";
      sound.loop = loop;
      sound.volume = volume;
      
      // Add loadeddata event to track when audio is ready
      sound.addEventListener('loadeddata', () => {
        console.log(`Audio loaded: ${src}`);
      });
      
      return sound;
    }
    
    // Preload all sounds to ensure they're ready to play
    preloadAllSounds() {
      // Preload all effect sounds
      Object.values(this.sounds).forEach(sound => {
        sound.load();
      });
      
      // Preload background music
      this.backgroundMusic.load();
    }
    
    // Play a sound with error handling and reset capability
    playSound(sound) {
      if (!this.soundEffectsEnabled || !sound) return Promise.reject("Sound effects disabled");
      
      // Reset sound to beginning before playing (prevents timing issues)
      sound.currentTime = 0;
      
      return sound.play().catch(error => {
        console.log(`Audio play failed: ${error}`);
        // Try to recover from common autoplay policy errors
        if (error.name === "NotAllowedError") {
          // Set a flag to retry play on next user interaction
          this._needsUserInteraction = true;
          document.addEventListener('click', this.handleUserInteraction.bind(this), { once: true });
        }
      });
    }
    
    // Handle user interaction to enable audio
    handleUserInteraction() {
      if (this._needsUserInteraction) {
        // Try to play background music again
        if (this.backgroundMusicEnabled) {
          this.backgroundMusic.play().catch(e => console.log("Still can't play audio:", e));
        }
        this._needsUserInteraction = false;
      }
    }
    
    // Play spin sound
    playSpinSound() {
      return this.playSound(this.sounds.spin);
    }
    
    // Play spin stop sound
    playSpinStopSound() {
      return this.playSound(this.sounds.spinStop);
    }
    
    // Play button press sound
    playButtonSound() {
      return this.playSound(this.sounds.buttonPress);
    }
    
    // Play win sound based on win amount
    playWinSound(winAmount) {
      if (!this.soundEffectsEnabled) return;
      
      // Choose the right win sound based on win amount
      if (winAmount >= 50) {
        return this.playSound(this.sounds.ultraWin);
      } else if (winAmount >= 20) {
        return this.playSound(this.sounds.megaWin);
      } else if (winAmount >= 10) {
        return this.playSound(this.sounds.bigWin);
      } else {
        return this.playSound(this.sounds.win);
      }
    }
    
    // Play bonus sound
    playBonusSound() {
      return this.playSound(this.sounds.bonus);
    }
    
    // Play background music
    playBackgroundMusic() {
      if (!this.backgroundMusicEnabled || !this.backgroundMusic) return;
      
      this.backgroundMusic.play().catch(error => {
        console.log(`Background music play failed: ${error}`);
        // Set a flag to retry play on next user interaction
        if (error.name === "NotAllowedError") {
          this._needsUserInteraction = true;
          document.addEventListener('click', this.handleUserInteraction.bind(this), { once: true });
        }
      });
    }
    
    // Pause background music
    pauseBackgroundMusic() {
      if (this.backgroundMusic) {
        this.backgroundMusic.pause();
      }
    }
    
    // Toggle sound effects
    toggleSoundEffects() {
      this.tempSoundEffectsEnabled = !this.tempSoundEffectsEnabled;
      return this.tempSoundEffectsEnabled;
    }
    
    // Toggle background music
    toggleBackgroundMusic() {
      this.tempBackgroundMusicEnabled = !this.tempBackgroundMusicEnabled;
      return this.tempBackgroundMusicEnabled;
    }
    
    // Apply temporary settings
    applySettings() {
      this.soundEffectsEnabled = this.tempSoundEffectsEnabled;
      this.backgroundMusicEnabled = this.tempBackgroundMusicEnabled;
      
      if (this.backgroundMusicEnabled) {
        this.playBackgroundMusic();
      } else {
        this.pauseBackgroundMusic();
      }
    }
    
    // Reset temporary settings to current settings
    resetTempSettings() {
      this.tempSoundEffectsEnabled = this.soundEffectsEnabled;
      this.tempBackgroundMusicEnabled = this.backgroundMusicEnabled;
    }
}

export default AudioManager
  