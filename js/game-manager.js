// Game Manager for Kong Game
import audioManager from './audio-manager.js';

class GameManager {
    constructor() {
        this.gameState = {
            isSpinning: false,
            isFreeSpinMode: false,
            currentBalance: 1000,
            currentBet: 10,
            autoSpinCount: 0,
            freeSpinsRemaining: 0,
            soundEnabled: true,
            currentWin: 0,
            totalWin: 0
        };
        
        // Initialize audio
        this.initAudio();
    }
    
    initAudio() {
        // Preload all sounds
        audioManager.preloadAll();
        
        // Start background music
        setTimeout(() => {
            audioManager.playBackgroundMusic(this.gameState.isFreeSpinMode);
        }, 1000);
    }
    
    // Spin functionality
    spin() {
        if (this.gameState.isSpinning) return false;
        
        // Play button press sound
        audioManager.play('spinButton');
        
        // Check if player has enough balance
        if (!this.gameState.isFreeSpinMode && this.gameState.currentBalance < this.gameState.currentBet) {
            // Not enough balance
            return false;
        }
        
        // Set spin state
        this.gameState.isSpinning = true;
        
        // Deduct bet if not in free spin mode
        if (!this.gameState.isFreeSpinMode) {
            this.gameState.currentBalance -= this.gameState.currentBet;
        } else {
            // Decrease free spins counter
            this.gameState.freeSpinsRemaining--;
        }
        
        // Play spin sound
        audioManager.play('reelSpin');
        
        return true;
    }
    
    // Handle spin result
    handleSpinResult(result) {
        // Play reel stop sound
        audioManager.play('reelStop');
        
        this.gameState.isSpinning = false;
        this.gameState.currentWin = result.winAmount || 0;
        
        // Handle win
        if (result.winAmount > 0) {
            this.handleWin(result);
        }
        
        // Check for free spins trigger
        if (result.freeSpinsTriggered) {
            this.startFreeSpins(result.freeSpinsAwarded);
        }
        
        // Update balance
        if (result.winAmount > 0) {
            this.gameState.currentBalance += result.winAmount;
            this.gameState.totalWin += result.winAmount;
        }
        
        // Check if we need to continue auto spin
        if (this.gameState.autoSpinCount > 0) {
            this.gameState.autoSpinCount--;
            
            // Auto continue if more auto spins remain
            if (this.gameState.autoSpinCount > 0) {
                setTimeout(() => this.spin(), 2000);
            }
        }
        
        // Check if we need to start next free spin
        if (this.gameState.isFreeSpinMode && this.gameState.freeSpinsRemaining > 0) {
            setTimeout(() => this.spin(), 2000);
        } else if (this.gameState.isFreeSpinMode && this.gameState.freeSpinsRemaining === 0) {
            // End free spins mode
            this.endFreeSpins();
        }
        
        return this.gameState;
    }
    
    // Handle win
    handleWin(result) {
        // Play appropriate win sound based on win size
        const winRatio = result.winAmount / this.gameState.currentBet;
        
        if (winRatio >= 50) {
            audioManager.play('jackpot');
        } else if (winRatio >= 20) {
            audioManager.play('ultraWin');
        } else if (winRatio >= 10) {
            audioManager.play('megaWin');
        } else if (winRatio >= 5) {
            audioManager.play('bigWin');
        } else {
            audioManager.playRandomHitSound();
        }
        
        // Play scoring sound for counting up animation
        audioManager.play('scoring');
    }
    
    // Start free spins mode
    startFreeSpins(count) {
        audioManager.play('bonusAlarm');
        
        this.gameState.isFreeSpinMode = true;
        this.gameState.freeSpinsRemaining = count;
        
        // Switch background music to free spins mode
        setTimeout(() => {
            audioManager.playBackgroundMusic(true);
        }, 2000);
    }
    
    // End free spins mode
    endFreeSpins() {
        audioManager.play('freeSpinEnd');
        
        this.gameState.isFreeSpinMode = false;
        
        // Switch background music back to base game
        setTimeout(() => {
            audioManager.playBackgroundMusic(false);
        }, 3000);
    }
    
    // Toggle sound
    toggleSound() {
        this.gameState.soundEnabled = audioManager.toggleMute();
        return this.gameState.soundEnabled;
    }
    
    // Start auto spin
    startAutoSpin(count) {
        audioManager.play('spinButton');
        this.gameState.autoSpinCount = count;
        this.spin();
    }
    
    // Stop auto spin
    stopAutoSpin() {
        this.gameState.autoSpinCount = 0;
    }
    
    // Change bet
    changeBet(amount) {
        if (!this.gameState.isSpinning) {
            this.gameState.currentBet = amount;
            audioManager.play('buttonPress');
        }
        return this.gameState.currentBet;
    }
}

// Export a singleton instance
const gameManager = new GameManager();
export default gameManager;