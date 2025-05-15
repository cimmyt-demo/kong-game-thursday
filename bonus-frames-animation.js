// Bonus Frame Animation Script
(function() {
    // Configuration
    const totalFrames = 8; // Number of animation frames
    const frameImages = []; // Will hold the loaded images
    let loadedImages = 0;
    let currentFrame = 0;
    let animationInterval = null;
    const lastReelIndex = 4; // 0-based index for the 5th reel
    const animationSpeed = 100; // ms between frames (adjust for faster/slower animation)
    
    // Function to initialize the bonus frame
    function initBonusFrame() {
        console.log("Initializing animated bonus frame for last reel...");
        loadFrameImages();
    }
    
    // Function to load the frame images
    function loadFrameImages() {
        for (let i = 0; i < totalFrames; i++) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            // Path to your frame images - adjust as needed
            img.src = `bonus-frames/frame_${i}.png`;
            img.onload = () => {
                loadedImages++;
                console.log(`Loaded frame ${i+1}/${totalFrames}`);
                if (loadedImages === totalFrames) {
                    console.log("All frames loaded, starting animation...");
                    hookIntoGameDrawFunctions();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load frame ${i}`);
            };
            frameImages.push(img);
        }
    }
    
    // Function to hook into the game's draw functions
    function hookIntoGameDrawFunctions() {
        // Make sure the game's drawing functions exist
        if (!window.drawStoppedReels) {
            console.error("Game drawing functions not found. Make sure this script runs after the game is initialized.");
            return;
        }
        
        // Store the original drawStoppedReels function
        const originalDrawStoppedReels = window.drawStoppedReels;
        
        // Override the drawStoppedReels function to add our bonus frame
        window.drawStoppedReels = function() {
            // Call the original function first
            originalDrawStoppedReels.apply(this, arguments);
            
            // Now add our bonus frame to the last reel
            if (loadedImages === totalFrames) {
                const canvas = document.getElementById('slotMachine');
                const ctx = canvas.getContext('2d');
                
                // Calculate dimensions
                const reelWidth = (canvas.width - window.WALL_THICKNESS.left - window.WALL_THICKNESS.right) / window.REEL_COUNT;
                const reelHeight = canvas.height - window.WALL_THICKNESS.top - window.WALL_THICKNESS.bottom;
                
                // Calculate position of the last reel
                const reelX = window.WALL_THICKNESS.left + lastReelIndex * reelWidth;
                const reelY = window.WALL_THICKNESS.top;
                
                // Only draw the frame if the reel is not spinning
                if (!window.reels[lastReelIndex].isSpinning) {
                    // Draw the current frame of the bonus border
                    ctx.drawImage(frameImages[currentFrame], reelX, reelY, reelWidth, reelHeight);
                }
            }
        };
        
        // Start the animation
        startAnimation();
    }
    
    // Function to start the animation
    function startAnimation() {
        // Clear any existing animation
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        
        // Start a new animation interval
        animationInterval = setInterval(() => {
            // Update to the next frame
            currentFrame = (currentFrame + 1) % totalFrames;
            
            // Redraw the game to update the frame
            if (window.drawGame && !window.spinning) {
                window.drawGame();
            }
        }, animationSpeed);
        
        // Also hook into the spin function to pause/resume animation
        if (window.spin) {
            const originalSpin = window.spin;
            window.spin = function() {
                // Pause animation during spin
                clearInterval(animationInterval);
                animationInterval = null;
                
                // Call original spin function
                originalSpin.apply(this, arguments);
                
                // Resume animation after spin completes
                const checkSpinning = setInterval(() => {
                    if (!window.spinning) {
                        clearInterval(checkSpinning);
                        startAnimation();
                    }
                }, 500);
            };
        }
    }
    
    // Initialize when the document is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Wait a bit to ensure the game is fully initialized
        setTimeout(initBonusFrame, 1000);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initBonusFrame, 1000);
        });
    }
})();