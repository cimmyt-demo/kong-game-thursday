// Main entry point for Kong Game
import gameManager from './game-manager.js';
import audioManager from './audio-manager.js';

// Initialize game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    // Set up UI event listeners
    setupEventListeners();
    
    // Check if browser supports audio
    checkAudioSupport();
    
    console.log('Kong Game initialized successfully');
}

function setupEventListeners() {
    // Sound toggle button
    const soundButton = document.getElementById('sound_toggle');
    if (soundButton) {
        soundButton.addEventListener('click', () => {
            const isMuted = gameManager.toggleSound();
            updateSoundButton(isMuted);
        });
    }
    
    // Spin button
    const spinButton = document.getElementById('spin_button');
    if (spinButton) {
        spinButton.addEventListener('click', () => {
            gameManager.spin();
        });
    }
    
    // Auto spin button
    const autoSpinButton = document.getElementById('auto_spin_button');
    if (autoSpinButton) {
        autoSpinButton.addEventListener('click', () => {
            openAutoSpinMenu();
        });
    }
    
    // Close auto spin menu button
    const closeAutoSpinButton = document.getElementById('close_auto_spin');
    if (closeAutoSpinButton) {
        closeAutoSpinButton.addEventListener('click', () => {
            closeAutoSpinMenu();
        });
    }
    
    // Auto spin option buttons
    const autoSpinOptions = document.querySelectorAll('.auto_spin_option');
    autoSpinOptions.forEach(button => {
        button.addEventListener('click', (e) => {
            const spins = parseInt(e.target.dataset.spins, 10);
            gameManager.startAutoSpin(spins);
            closeAutoSpinMenu();
        });
    });
    
    // Bet buttons
    const betButtons = document.querySelectorAll('.bet_button');
    betButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const betAmount = parseFloat(e.target.dataset.bet);
            gameManager.changeBet(betAmount);
            updateBetDisplay(betAmount);
        });
    });
}

function updateSoundButton(isMuted) {
    const soundButton = document.getElementById('sound_toggle');
    if (soundButton) {
        if (isMuted) {
            soundButton.classList.add('muted');
        } else {
            soundButton.classList.remove('muted');
        }
    }
}

function updateBetDisplay(betAmount) {
    const betDisplay = document.getElementById('bet_amount');
    if (betDisplay) {
        betDisplay.textContent = betAmount.toFixed(2);
    }
}

function openAutoSpinMenu() {
    const autoSpinMenu = document.getElementById('auto_spin_menu');
    if (autoSpinMenu) {
        autoSpinMenu.style.display = 'block';
    }
}

function closeAutoSpinMenu() {
    const autoSpinMenu = document.getElementById('auto_spin_menu');
    if (autoSpinMenu) {
        autoSpinMenu.style.display = 'none';
    }
}

function checkAudioSupport() {
    // Check if browser supports Audio API
    try {
        const audio = new Audio();
        if (typeof audio.play !== 'function') {
            console.warn('Audio playback not supported in this browser');
        }
    } catch (e) {
        console.error('Error checking audio support:', e);
    }
}