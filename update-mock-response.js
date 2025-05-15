// Example of the updated generateDemoMockResponse function
function generateDemoMockResponse(params, feature) {
    // Generate random reels
    const reels = [];
    for (let i = 0; i < 5; i++) {
        const reel = [];
        for (let j = 0; j < 3; j++) {
            const symbolKeys = Object.keys(KONG_SYMBOLS);
            const randomIndex = Math.floor(Math.random() * symbolKeys.length * 0.8);
            const symbol = symbolKeys[Math.min(randomIndex, symbolKeys.length - 1)];
            reel.push(symbol);
        }
        reels.push(reel);
    }

    // Initial values
    let winAmount = 0;
    let bonusMultiplier = params.bonus_multiplier;
    let freeSpinCount = params.free_spin_count;
    let freeSpinTriggered = false;
    const betAmount = params.is_free_spin ? params.original_bet_amount : params.bet_amount;
    
    // Array to track winning positions
    const winningPositions = [];

    const isFirstSpin = firstSpinFlags[feature];

    if (feature === "free spins" && isFirstSpin) {
        freeSpinTriggered = true;
        freeSpinCount += 13;
        const scatterCount = Math.floor(Math.random() * 3) + 5;
        bonusMultiplier = [3, 6, 9, 18, 36, 72][scatterCount - 5] || 3;
        
        // Add scatter winning positions
        for (let i = 0; i < 5; i++) {
            // Randomly place scatters on each reel
            if (Math.random() < 0.7) { // 70% chance to have a scatter on this reel
                const rowPosition = Math.floor(Math.random() * 3);
                reels[i][rowPosition] = "Scatter"; // Force a scatter symbol
                winningPositions.push({
                    symbol: "Scatter",
                    reel: i,
                    row: rowPosition
                });
            }
        }

    } else if (feature === "big win" && isFirstSpin) {
        winAmount = Math.floor(Math.random() * 401) + 200;
        
        // Create winning combinations for big win
        // For example, 5 of a kind with a high-value symbol
        const highValueSymbols = ["Treasure Chest", "Explorer", "Compass", "Binoculars"];
        const selectedSymbol = highValueSymbols[Math.floor(Math.random() * highValueSymbols.length)];
        
        // Place the winning symbols on the first row
        for (let i = 0; i < 5; i++) {
            reels[i][0] = selectedSymbol;
            winningPositions.push({
                symbol: selectedSymbol,
                reel: i,
                row: 0
            });
        }

    } else if (feature === "normal spin" && isFirstSpin) {
        freeSpinTriggered = false;
        const hasWin = Math.random() < 0.3;
        if (hasWin) {
            const multiplier = Math.floor(Math.random() * 4) + 1;
            winAmount = betAmount * multiplier;
            
            // Create a simple 3 of a kind win
            const regularSymbols = ["A", "K", "Q", "J"];
            const selectedSymbol = regularSymbols[Math.floor(Math.random() * regularSymbols.length)];
            
            // Place winning symbols on the first 3 reels
            for (let i = 0; i < 3; i++) {
                const row = Math.floor(Math.random() * 3);
                reels[i][row] = selectedSymbol;
                winningPositions.push({
                    symbol: selectedSymbol,
                    reel: i,
                    row: row
                });
            }
        }

    } else {
        // Normal logic for subsequent spins
        freeSpinTriggered = params.is_free_spin ? false : Math.random() < 0.05;
        const hasWin = Math.random() < 0.3;
        if (hasWin) {
            const multiplier = Math.floor(Math.random() * 10) + 1;
            winAmount = betAmount * multiplier;
            if (params.is_free_spin && bonusMultiplier > 0) {
                winAmount *= bonusMultiplier;
            }
            
            // Generate random winning positions
            const symbolOptions = ["Treasure Chest", "Explorer", "Compass", "Binoculars", "A", "K", "Q", "J"];
            const selectedSymbol = symbolOptions[Math.floor(Math.random() * symbolOptions.length)];
            
            // Determine how many symbols in the winning combination (3-5)
            const winLength = Math.min(3 + Math.floor(Math.random() * 3), 5);
            
            // Create the winning combination
            for (let i = 0; i < winLength; i++) {
                const row = Math.floor(Math.random() * 3);
                reels[i][row] = selectedSymbol;
                winningPositions.push({
                    symbol: selectedSymbol,
                    reel: i,
                    row: row
                });
            }
        }
    }

    // Apply bonus multiplier if free spins triggered naturally
    if (freeSpinTriggered && feature !== "free spins") {
        const scatterCount = Math.floor(Math.random() * 3) + 5;
        bonusMultiplier = [3, 6, 9, 18, 36, 72][scatterCount - 5] || 3;
        
        // Add scatter positions for free spin trigger
        for (let i = 0; i < 5; i++) {
            const rowPosition = Math.floor(Math.random() * 3);
            reels[i][rowPosition] = "Scatter";
            winningPositions.push({
                symbol: "Scatter",
                reel: i,
                row: rowPosition
            });
        }
    }

    if (params.is_free_spin && feature !== "free spins") {
        freeSpinCount = Math.max(0, params.free_spin_count - 1);
    }

    // Switch off the first-spin flag for this feature
    firstSpinFlags[feature] = false;

    return {
        status: "success",
        message: "",
        reels: reels,
        win_amount: winAmount,
        is_free_spin: freeSpinCount > 0,
        free_spin_count: freeSpinCount,
        bonus_multiplier: bonusMultiplier,
        free_spin_triggered: freeSpinTriggered,
        winning_positions: winningPositions // Add the winning positions to the response
    };
}
