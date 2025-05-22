// Audio Manager for Kong Game
var AudioManagerForKong = function() {
    // Helper function to create Audio objects with crossOrigin set
    function createAudio(src) {
        var audio = new Audio(src);
        audio.crossOrigin = "anonymous";
        return audio;
    }
    
    this.sounds = {
        spinButton: createAudio('sounds/SE_ButtonPress.mp3'),
        reelSpin: createAudio('sounds/SE_ReelSpeedUp.mp3'),
        reelStop: createAudio('sounds/SE_Spinstop.mp3'),
        baseBackground: createAudio('sounds/SE_Base_BG.mp3'),
        freeSpinBackground: createAudio('sounds/SE_Free_BG.mp3'),
        baseHit1: createAudio('sounds/SE_Base_Hit_01.mp3'),
        baseHit2: createAudio('sounds/SE_Base_Hit_02.mp3'),
        baseHit3: createAudio('sounds/SE_Base_Hit_03.mp3'),
        baseHit4: createAudio('sounds/SE_Base_Hit_04.mp3'),
        baseHit5: createAudio('sounds/SE_Base_Hit_05.mp3'),
        bigWin: createAudio('sounds/SE_BigWin.mp3'),
        megaWin: createAudio('sounds/SE_MegaWin.mp3'),
        ultraWin: createAudio('sounds/SE_UltraWin.mp3'),
        jackpot: createAudio('sounds/SE_Jackpot.mp3'),
        bonusAlarm: createAudio('sounds/SE_BonusAlarm.mp3'),
        freeSpinEnd: createAudio('sounds/SE_FreeSpinEnd.mp3'),
        freeSpinEnd2: createAudio('sounds/SE_FreeSpinEnd_02.mp3'),
        freeItem1: createAudio('sounds/SE_Free_Item_01.mp3'),
        freeItem2: createAudio('sounds/SE_Free_Item_02.mp3'),
        freeItem3: createAudio('sounds/SE_Free_Item_03.mp3'),
        freeItem4: createAudio('sounds/SE_Free_Item_04.mp3'),
        scoringEnd: createAudio('sounds/SE_ScoringEnd.mp3'),
        scoring: createAudio('sounds/SE_Scoring_01.mp3'),
        treasureSymbol: createAudio('sounds/SE_TS.mp3')
    };

    // Set loop for background music
    this.sounds.baseBackground.loop = true;
    this.sounds.freeSpinBackground.loop = true;

    // Set volume for all sounds
    this.setGlobalVolume(0.7);
    
    // Mute state
    this.muted = false;
};

// Set volume for all sound effects
AudioManagerForKong.prototype.setGlobalVolume = function(volume) {
    for (var sound in this.sounds) {
        if (this.sounds.hasOwnProperty(sound)) {
            this.sounds[sound].volume = volume;
        }
    }
};

// Play a sound with error handling
AudioManagerForKong.prototype.play = function(soundName) {
    if (this.muted) return;
    
    if (this.sounds[soundName]) {
        // Reset the sound to beginning before playing
        this.sounds[soundName].currentTime = 0;
        
        // Play the sound with error handling
        var self = this;
        this.sounds[soundName].play().catch(function(error) {
            console.error('Error playing sound ' + soundName + ':', error);
            
            // Try reloading and playing again
            self.sounds[soundName].load();
            setTimeout(function() {
                self.sounds[soundName].play().catch(function(e) {
                    console.error('Second attempt to play sound failed:', e);
                });
            }, 100);
        });
    } else {
        console.warn('Sound ' + soundName + ' not found');
    }
};

// Stop a specific sound
AudioManagerForKong.prototype.stop = function(soundName) {
    if (this.sounds[soundName]) {
        this.sounds[soundName].pause();
        this.sounds[soundName].currentTime = 0;
    }
};

// Stop all sounds
AudioManagerForKong.prototype.stopAll = function() {
    for (var sound in this.sounds) {
        if (this.sounds.hasOwnProperty(sound)) {
            this.sounds[sound].pause();
            this.sounds[sound].currentTime = 0;
        }
    }
};

// Toggle mute state
AudioManagerForKong.prototype.toggleMute = function() {
    this.muted = !this.muted;
    
    for (var sound in this.sounds) {
        if (this.sounds.hasOwnProperty(sound)) {
            this.sounds[sound].muted = this.muted;
        }
    }
    
    return this.muted;
};

// Preload all sounds
AudioManagerForKong.prototype.preloadAll = function() {
    for (var sound in this.sounds) {
        if (this.sounds.hasOwnProperty(sound)) {
            this.sounds[sound].load();
        }
    }
};

// Random hit sound (1-5)
AudioManagerForKong.prototype.playRandomHitSound = function() {
    var randomNum = Math.floor(Math.random() * 5) + 1;
    this.play('baseHit' + randomNum);
};

// Play background music based on game mode
AudioManagerForKong.prototype.playBackgroundMusic = function(isFreeSpinMode) {
    // Stop any playing background music
    this.stop('baseBackground');
    this.stop('freeSpinBackground');
    
    // Play the appropriate background music
    if (isFreeSpinMode) {
        this.play('freeSpinBackground');
    } else {
        this.play('baseBackground');
    }
};

// Create a single instance for the entire game
var gameAudioManager = new AudioManagerForKong();