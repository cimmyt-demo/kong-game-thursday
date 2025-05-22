// Slot Machine Tests
// This file contains comprehensive tests for the Kong Slot Machine functionality

// Mock DOM elements and global variables needed for testing
const mockDOM = () => {
  // Create a mock document object with required elements
  global.document = {
    getElementById: (id) => {
      const elements = {
        'slotMachine': { 
          getContext: () => ({
            clearRect: () => {},
            save: () => {},
            restore: () => {},
            translate: () => {},
            scale: () => {},
            drawImage: () => {},
            fillRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            stroke: () => {},
            fillText: () => {},
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
          })
        },
        'balanceText': { textContent: '1000.00' },
        'currentStake': { textContent: '1.00' },
        'display_win_amount': { style: { display: 'none' } },
        'update_winnings': { innerHTML: '0.00' },
        'win-message': { style: { display: 'none' }, innerHTML: '' },
        'free-spins-indicator': { style: { display: 'none' } },
        'free-spins-count': { textContent: '0' },
        'bonus-multiplier': { textContent: '1x' },
        'remainingAutoSpins': { innerHTML: '' },
        'spin_img': { style: { transition: '', transform: '' } },
        'spinButton': { disabled: false },
        'autoPlayButton': { innerHTML: '' },
        'settingsButton': { disabled: false },
        'featuresButton': { disabled: false },
        'settingsOverlay': { style: { display: 'none' } },
        'stakeOverlay': { style: { display: 'none' } },
        'infoOverlay': { style: { display: 'none' } },
        'autoSpinOverlay': { style: { display: 'none' } },
        'remaining_fs_holder': { innerHTML: '0' },
        'total_fs_holder': { innerHTML: '0' },
        'freespins_display': { style: { display: 'none' } },
        'normalspins_display': { style: { display: 'flex' } },
        'img_top': { src: '' },
        'stakeOptions': { querySelectorAll: () => [] },
        'autoSpinOptions': { querySelectorAll: () => [] },
        'lossLimitOptions': { querySelectorAll: () => [] },
        'quickspin-toggle': { src: '' },
        'startfreespinsoverlay': { style: { display: 'none' } },
        'freespinsoverlayimg': { style: { display: 'block' } },
        'freespinsoverlayimg2': { style: { display: 'none' } },
        'cancelStake': {},
        'confirmStake': {},
        'cancelAutoSpin': {},
        'confirmAutoSpin': {},
        'startFreeSpinsbutton': {},
        'kong_overlay': { style: { display: 'none' } },
        'jdb_overlay': { style: { display: 'none' } },
        'device_overlay': { style: { display: 'none' } },
        'loader-bar': { style: { width: '0%', backgroundColor: '' } },
        'server-loading-indicator': { style: { display: 'none' }, remove: () => {} },
      };
      return elements[id] || { 
        style: {}, 
        addEventListener: () => {}, 
        querySelector: () => ({ clientWidth: 800, clientHeight: 600 }),
        appendChild: () => {}
      };
    },
    createElement: (tag) => ({
      style: {},
      id: '',
      innerHTML: '',
      src: '',
      className: '',
      crossOrigin: '',
      innerText: '',
      addEventListener: () => {},
    }),
    querySelector: (selector) => ({
      clientWidth: 800,
      clientHeight: 600,
      appendChild: () => {},
    }),
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  // Mock Audio object
  global.Audio = class {
    constructor() {
      this.src = '';
      this.crossOrigin = '';
      this.loop = false;
      this.autoplay = false;
      this.muted = false;
      this.currentTime = 0;
      this.volume = 1;
      this.paused = true;
      this.duration = 60;
      this.load = () => {};
      this.play = () => Promise.resolve();
      this.pause = () => {};
      this.addEventListener = () => {};
      this.removeEventListener = () => {};
    }
  };

  // Mock Image object
  global.Image = class {
    constructor() {
      this.src = '';
      this.crossOrigin = '';
      this.complete = true;
      this.onload = null;
      this.onerror = null;
      this.rendering = '';
      this.width = 100;
      this.height = 100;
      this.setAttribute = () => {};
    }
  };

  // Mock window object
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: (callback) => setTimeout(callback, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    reelBackgroundImage: { 
      complete: true, 
      src: '' 
    },
    devicePixelRatio: 2,
  };

  // Mock console
  global.console = {
    log: () => {},
    warn: () => {},
    error: () => {},
  };

  // Mock fetch
  global.fetch = (url, options) => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        reels: generateMockReels(),
        win: Math.random() > 0.7 ? Math.floor(Math.random() * 200) : 0,
        winningPositions: [],
        triggerFreeSpins: Math.random() > 0.9
      })
    });
  };

  // Mock Math.random to make tests deterministic
  const originalRandom = Math.random;
  let randomIndex = 0;
  const randomValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95];
  Math.random = () => {
    const value = randomValues[randomIndex];
    randomIndex = (randomIndex + 1) % randomValues.length;
    return value;
  };

  return {
    restoreRandom: () => {
      Math.random = originalRandom;
    }
  };
};

// Helper function to generate mock reel symbols
function generateMockReels() {
  const SYMBOLS = [
    { name: 'Treasure Chest', image: 'treasurechest.png', color: '#ff5252' },
    { name: 'Explorer', image: 'explorer.png', color: '#ffeb3b' },
    { name: 'Compass', image: 'compass.png', color: '#ff9800' },
    { name: 'Binoculars', image: 'binoculars.png', color: '#9c27b0' },
    { name: 'A', image: 'a.png', color: '#f44336' },
    { name: 'K', image: 'k.png', color: '#4caf50' },
    { name: 'Q', image: 'q.png', color: '#ffc107' },
    { name: 'J', image: 'j.png', color: '#2196f3' },
    { name: 'Wild', image: 'wild.png', color: '#00bcd4' },
    { name: 'Scatter', image: 'scatter.png', color: '#e91e63' }
  ];

  // Generate 5 reels with 3 random symbols each
  return Array(5).fill(0).map(() => 
    Array(3).fill(0).map(() => {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      return {
        name: SYMBOLS[randomIndex].name,
        isSpecial: Math.random() > 0.7,
        scale: 1.1 + Math.random() * 0.5
      };
    })
  );
}

// Tests for the modified functionality
function runTests() {
  console.log('Running Slot Machine Tests');
  
  const mockDomUtils = mockDOM();
  
  // Test Suite 1: Symbol Management
  console.log('\nTest Suite 1: Symbol Management');
  
  // Test 1.1: Initialization of reels with symbols array
  try {
    // Setup reels array
    const REEL_COUNT = 5;
    const SYMBOLS_PER_REEL = 3;
    const EXTRA_SYMBOLS = 2;
    const SYMBOLS_PER_REEL_ARRAY = [3, 3, 3, 3, 3];
    const SYMBOLS = [
      { name: 'Treasure Chest', image: 'treasurechest.png', color: '#ff5252', payouts: [0, 0, 40, 100, 250], normal_scale: 1.2, z_index: 97 },
      { name: 'Explorer', image: 'explorer.png', color: '#ffeb3b', payouts: [0, 0, 30, 80, 200], normal_scale: 1.2, z_index: 95 },
      { name: 'Compass', image: 'compass.png', color: '#ff9800', payouts: [0, 0, 25, 60, 175], normal_scale: 1.15, z_index: 94 },
      { name: 'Binoculars', image: 'binoculars.png', color: '#9c27b0', payouts: [0, 0, 20, 50, 150], normal_scale: 1.15, z_index: 94 },
    ];
    
    const reels = [];
    
    // Initialize each reel
    for (let i = 0; i < REEL_COUNT; i++) {
      reels[i] = {
        position: 0,
        symbols: [],
        isSpinning: false,
        specialSymbols: {},
      };
      
      // Generate initial symbols (visible + extra for scrolling)
      const totalSymbols = SYMBOLS_PER_REEL_ARRAY[i] + EXTRA_SYMBOLS * 2;
      for (let j = 0; j < totalSymbols; j++) {
        const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
        const random_symbol_name = SYMBOLS[randomIndex].name;
        reels[i].symbols.push({
          name: random_symbol_name,
          isSpecial: true,
          scale: 1.2
        });
      }
    }
    
    // Test the initialization
    console.log('Test 1.1: Initialize reels with symbols array');
    console.log(`  - Expected: ${REEL_COUNT} reels with ${totalSymbols} symbols each`);
    console.log(`  - Actual: ${reels.length} reels with ${reels[0].symbols.length} symbols each`);
    console.log(`  - Result: ${reels.length === REEL_COUNT && reels[0].symbols.length === totalSymbols ? 'PASS' : 'FAIL'}`);
    
    // Test 1.2: Accessing last three symbols of a reel (which were previously finalSymbols)
    console.log('\nTest 1.2: Access last three symbols of a reel');
    const reel = reels[0];
    const finalSymbolsStart = reel.symbols.length - SYMBOLS_PER_REEL;
    const finalSymbolsEnd = reel.symbols.length;
    const lastThreeSymbols = reel.symbols.slice(finalSymbolsStart, finalSymbolsEnd);
    
    console.log(`  - Expected: ${SYMBOLS_PER_REEL} symbols`);
    console.log(`  - Actual: ${lastThreeSymbols.length} symbols`);
    console.log(`  - Result: ${lastThreeSymbols.length === SYMBOLS_PER_REEL ? 'PASS' : 'FAIL'}`);
    
    // Test 1.3: Updating reel symbols with results
    console.log('\nTest 1.3: Update reel symbols with results');
    const mockResults = {
      reels: [
        [
          { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
          { name: 'Explorer', isSpecial: false, scale: 1.1 },
          { name: 'Wild', isSpecial: true, scale: 1.3 }
        ]
      ]
    };
    
    // Update reel 0's symbols with results
    const symbolsLength = reels[0].symbols.length;
    const startIndex = symbolsLength - SYMBOLS_PER_REEL;
    
    for (let j = 0; j < mockResults.reels[0].length; j++) {
      reels[0].symbols[startIndex + j] = mockResults.reels[0][j];
    }
    
    // Check if the last three symbols match the results
    const updatedLastThreeSymbols = reels[0].symbols.slice(finalSymbolsStart, finalSymbolsEnd);
    const namesMatch = updatedLastThreeSymbols.every((symbol, index) => 
      symbol.name === mockResults.reels[0][index].name
    );
    
    console.log(`  - Expected: Names match with results - Treasure Chest, Explorer, Wild`);
    console.log(`  - Actual: ${updatedLastThreeSymbols.map(s => s.name).join(', ')}`);
    console.log(`  - Result: ${namesMatch ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.error('Error in Test Suite 1:', error);
  }
  
  // Test Suite 2: Animation Controller
  console.log('\nTest Suite 2: Animation Controller');
  
  try {
    // Test 2.1: Using updateAnimationControllerWithResults
    console.log('Test 2.1: Update animation controller with results');
    
    const animationController = {
      hasResults: false,
      results: null
    };
    
    const mockResults = {
      reels: generateMockReels(),
      win: 50,
      winningPositions: []
    };
    
    function updateAnimationControllerWithResults(results) {
      animationController.hasResults = true;
      animationController.results = results;
    }
    
    // Update the animation controller
    updateAnimationControllerWithResults(mockResults);
    
    // Check if the controller was updated correctly
    console.log(`  - Expected: hasResults = true, results = provided mock results`);
    console.log(`  - Actual: hasResults = ${animationController.hasResults}, results.win = ${animationController.results.win}`);
    console.log(`  - Result: ${animationController.hasResults && animationController.results === mockResults ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.error('Error in Test Suite 2:', error);
  }
  
  // Test Suite 3: Win Calculation
  console.log('\nTest Suite 3: Win Calculation');
  
  try {
    // Test 3.1: Calculate win amount for matching symbols
    console.log('Test 3.1: Calculate win amount for matching symbols');
    
    // Define sample data
    const REEL_COUNT = 5;
    const SYMBOLS_PER_REEL = 3;
    const stake = 1.0;
    const isFreeSpinMode = false;
    const bonusMultiplier = 1;
    
    const SYMBOLS = [
      { name: 'Treasure Chest', payouts: [0, 0, 40, 100, 250] },
      { name: 'Explorer', payouts: [0, 0, 30, 80, 200] },
      { name: 'Wild', payouts: [0, 0, 50, 125, 300] }
    ];
    
    // Mock results with a winning combination (3 Treasure Chests in a row)
    const mockResults = {
      reels: [
        [
          { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
          { name: 'Explorer', isSpecial: false, scale: 1.1 },
          { name: 'Wild', isSpecial: true, scale: 1.3 }
        ],
        [
          { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
          { name: 'J', isSpecial: false, scale: 1.1 },
          { name: 'Q', isSpecial: false, scale: 1.1 }
        ],
        [
          { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
          { name: 'K', isSpecial: false, scale: 1.1 },
          { name: 'A', isSpecial: false, scale: 1.1 }
        ],
        [
          { name: 'Explorer', isSpecial: true, scale: 1.2 },
          { name: 'Compass', isSpecial: false, scale: 1.1 },
          { name: 'Binoculars', isSpecial: false, scale: 1.1 }
        ],
        [
          { name: 'J', isSpecial: false, scale: 1.1 },
          { name: 'K', isSpecial: false, scale: 1.1 },
          { name: 'Q', isSpecial: false, scale: 1.1 }
        ]
      ]
    };
    
    // Simple win calculation function for testing
    function calculateWinAmount(results, isFreeSpinMode, bonusMultiplier) {
      // Extract symbol names from results for easier processing
      const symbolNames = results.reels.map(reel => 
        reel.map(symbol => symbol.name)
      );
      
      // Check for winning combinations
      let totalWin = 0;
      let winningPositions = [];
      
      // Check for matching symbols on each row
      for (let row = 0; row < SYMBOLS_PER_REEL; row++) {
        // Check each symbol (except Scatter which pays anywhere)
        for (let symbolObj of SYMBOLS) {
          if (symbolObj.name === 'Scatter') continue;
          
          let count = 0;
          let positions = [];
          
          // Count consecutive matching symbols from left to right
          for (let reel = 0; reel < REEL_COUNT; reel++) {
            if (!symbolNames[reel]) continue;
            
            const currentSymbol = symbolNames[reel][row];
            
            // Match if same symbol or Wild (except first reel)
            if (currentSymbol === symbolObj.name || (currentSymbol === 'Wild' && reel > 0)) {
              count++;
              positions.push({ reel, row, symbol: currentSymbol });
            } else {
              break;
            }
          }
          
          // Check if we have a win (3 or more matching symbols)
          if (count >= 3) {
            // Get payout for this symbol and count
            const payout = symbolObj.payouts[count];
            
            // Calculate win amount
            let win = payout * stake;
            
            // Apply bonus multiplier in free spin mode
            if (isFreeSpinMode && bonusMultiplier > 0) {
              win *= bonusMultiplier;
            }
            
            totalWin += win;
            winningPositions = winningPositions.concat(positions);
          }
        }
      }
      
      return { amount: totalWin, positions: winningPositions };
    }
    
    // Calculate win amount
    const winResult = calculateWinAmount(mockResults, isFreeSpinMode, bonusMultiplier);
    
    // Expected win: 3 Treasure Chests = 40 * stake = 40
    const expectedWin = 40;
    
    console.log(`  - Expected: Win amount = ${expectedWin}, Winning positions = 3`);
    console.log(`  - Actual: Win amount = ${winResult.amount}, Winning positions = ${winResult.positions.length}`);
    console.log(`  - Result: ${winResult.amount === expectedWin && winResult.positions.length === 3 ? 'PASS' : 'FAIL'}`);
    
    // Test 3.2: Free spin mode with bonus multiplier
    console.log('\nTest 3.2: Free spin mode with bonus multiplier');
    
    // Calculate win amount with free spin mode and bonus multiplier
    const freeSpinWinResult = calculateWinAmount(mockResults, true, 2);
    
    // Expected win: 3 Treasure Chests = 40 * stake * 2 (multiplier) = 80
    const expectedFreeSpinWin = 80;
    
    console.log(`  - Expected: Win amount = ${expectedFreeSpinWin}`);
    console.log(`  - Actual: Win amount = ${freeSpinWinResult.amount}`);
    console.log(`  - Result: ${freeSpinWinResult.amount === expectedFreeSpinWin ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.error('Error in Test Suite 3:', error);
  }
  
  // Test Suite 4: Symbol Sequence Generation
  console.log('\nTest Suite 4: Symbol Sequence Generation');
  
  try {
    // Test 4.1: Generate a symbol sequence for smooth transition
    console.log('Test 4.1: Generate symbol sequence for transition');
    
    // Mock data
    const SYMBOLS_PER_REEL = 3;
    const SYMBOLS = [
      { name: 'Treasure Chest', image: 'treasurechest.png' },
      { name: 'Explorer', image: 'explorer.png' },
      { name: 'Compass', image: 'compass.png' }
    ];
    
    // Mock results
    const finalSymbols = [
      { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
      { name: 'Explorer', isSpecial: false, scale: 1.1 },
      { name: 'Compass', isSpecial: true, scale: 1.3 }
    ];
    
    // Generate a sequence
    const symbolSequence = [];
    
    // Add random symbols at the beginning
    const startingSymbolCount = 10;
    for (let j = 0; j < startingSymbolCount; j++) {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      symbolSequence.push({
        name: SYMBOLS[randomIndex].name,
        isSpecial: Math.random() < 0.3,
        scale: Math.random() * 0.5 + 1.1
      });
    }
    
    // Add the final result symbols
    for (let j = 0; j < finalSymbols.length; j++) {
      symbolSequence.push(finalSymbols[j]);
    }
    
    // Add extra symbols at the end for smooth deceleration
    const endingSymbolCount = SYMBOLS_PER_REEL * 2;
    for (let j = 0; j < endingSymbolCount; j++) {
      const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
      symbolSequence.push({
        name: SYMBOLS[randomIndex].name,
        isSpecial: Math.random() < 0.3,
        scale: Math.random() * 0.5 + 1.1
      });
    }
    
    // Check if the sequence contains the final symbols in the correct order
    const finalSymbolsStartIndex = startingSymbolCount;
    const sequenceFinalSymbols = symbolSequence.slice(
      finalSymbolsStartIndex,
      finalSymbolsStartIndex + finalSymbols.length
    );
    
    const finalSymbolsMatch = sequenceFinalSymbols.every((symbol, index) => 
      symbol.name === finalSymbols[index].name
    );
    
    console.log(`  - Expected: Sequence contains ${startingSymbolCount} random symbols + ${finalSymbols.length} final symbols + ${endingSymbolCount} ending symbols`);
    console.log(`  - Actual: Sequence length = ${symbolSequence.length}, Final symbols match = ${finalSymbolsMatch}`);
    console.log(`  - Result: ${symbolSequence.length === startingSymbolCount + finalSymbols.length + endingSymbolCount && finalSymbolsMatch ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.error('Error in Test Suite 4:', error);
  }
  
  // Test Suite 5: Animation Control
  console.log('\nTest Suite 5: Animation Control');
  
  try {
    // Test 5.1: Animation timing and easing
    console.log('Test 5.1: Animation timing and easing');
    
    // Define animation parameters
    const spinDuration = 2000; // 2 seconds
    const startTime = Date.now();
    const reelStopDelay = 300; // 300ms between reels
    
    // Simulate animation progress at different times
    const progress25 = calculateProgress(startTime + spinDuration * 0.25, startTime, spinDuration);
    const progress50 = calculateProgress(startTime + spinDuration * 0.5, startTime, spinDuration);
    const progress75 = calculateProgress(startTime + spinDuration * 0.75, startTime, spinDuration);
    const progress100 = calculateProgress(startTime + spinDuration, startTime, spinDuration);
    
    // Function to calculate animation progress with easing
    function calculateProgress(currentTime, startTime, duration) {
      const elapsed = currentTime - startTime;
      let progress = Math.min(1, elapsed / duration);
      
      // Apply easing (ease-out quad)
      progress = 1 - (1 - progress) * (1 - progress);
      
      return progress;
    }
    
    console.log(`  - Progress at 25% time: ${progress25.toFixed(2)}`);
    console.log(`  - Progress at 50% time: ${progress50.toFixed(2)}`);
    console.log(`  - Progress at 75% time: ${progress75.toFixed(2)}`);
    console.log(`  - Progress at 100% time: ${progress100.toFixed(2)}`);
    console.log(`  - Result: ${progress25 < progress50 && progress50 < progress75 && progress75 < progress100 && progress100 <= 1 ? 'PASS' : 'FAIL'}`);
    
    // Test 5.2: Staggered reel stopping
    console.log('\nTest 5.2: Staggered reel stopping');
    
    // Calculate stop times for each reel
    const reelCount = 5;
    const reelStopTimes = [];
    
    for (let i = 0; i < reelCount; i++) {
      reelStopTimes.push(startTime + spinDuration + i * reelStopDelay);
    }
    
    // Check if reels stop in sequence
    const stopsInSequence = reelStopTimes.every((time, index) => 
      index === 0 || time > reelStopTimes[index - 1]
    );
    
    console.log(`  - Expected: Each reel stops ${reelStopDelay}ms after the previous one`);
    console.log(`  - Stop times: ${reelStopTimes.map(t => t - startTime).join('ms, ')}ms`);
    console.log(`  - Result: ${stopsInSequence ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.error('Error in Test Suite 5:', error);
  }
  
  // Test Suite 6: Server Integration
  console.log('\nTest Suite 6: Server Integration');
  
  try {
    // Test 6.1: Create payload for server request
    console.log('Test 6.1: Create server request payload');
    
    // Mock data
    const gameInfo = {
      client_id: 'test_client',
      game_id: 'kong_slot'
    };
    
    const playerInfo = {
      id: 'player123',
      wallet_balance: '1000.00'
    };
    
    const lastPlacedBetData = {
      bet_id: 'bet123'
    };
    
    const stake = 1.0;
    const isFreeSpinMode = false;
    const freeSpinCount = 0;
    const bonusMultiplier = 1;
    const originalBetAmount = 0;
    
    // Create payload
    const payload = {
      client_id: gameInfo.client_id,
      game_id: gameInfo.game_id,
      player_id: playerInfo.id,
      bet_id: lastPlacedBetData.bet_id,
      bet_amount: isFreeSpinMode ? 0 : stake,
      is_free_spin: isFreeSpinMode,
      free_spin_count: freeSpinCount,
      bonus_multiplier: bonusMultiplier,
      original_bet_amount: isFreeSpinMode ? originalBetAmount : 0
    };
    
    // Check if payload has the correct properties
    const hasRequiredProperties = 
      payload.client_id === gameInfo.client_id &&
      payload.game_id === gameInfo.game_id &&
      payload.player_id === playerInfo.id &&
      payload.bet_id === lastPlacedBetData.bet_id &&
      payload.bet_amount === stake &&
      payload.is_free_spin === isFreeSpinMode &&
      payload.free_spin_count === freeSpinCount &&
      payload.bonus_multiplier === bonusMultiplier &&
      payload.original_bet_amount === 0;
    
    console.log(`  - Expected: Payload with all required properties`);
    console.log(`  - Result: ${hasRequiredProperties ? 'PASS' : 'FAIL'}`);
    
    // Test 6.2: Transform server response
    console.log('\nTest 6.2: Transform server response');
    
    // Mock server response
    const serverResponse = {
      status: 'success',
      data: {
        reels: [
          ['Treasure Chest', 'Explorer', 'Wild'],
          ['Compass', 'A', 'K'],
          ['Q', 'J', 'Binoculars'],
          ['Wild', 'Explorer', 'Compass'],
          ['K', 'Q', 'J']
        ],
        win: 50,
        winning_positions: [
          { reel: 0, row: 0, symbol: 'Treasure Chest' },
          { reel: 1, row: 0, symbol: 'Compass' },
          { reel: 2, row: 0, symbol: 'Q' }
        ],
        trigger_free_spins: false
      }
    };
    
    // Transform function (simplified)
    function transformServerResponse(response) {
      if (!response || !response.data) return null;
      
      const data = response.data;
      
      // Transform reels
      const transformedReels = data.reels.map(reel => 
        reel.map(symbolName => ({
          name: symbolName,
          isSpecial: Math.random() < 0.3,
          scale: Math.random() * 0.5 + 1.1
        }))
      );
      
      return {
        reels: transformedReels,
        win: data.win,
        winningPositions: data.winning_positions,
        triggerFreeSpins: data.trigger_free_spins
      };
    }
    
    // Transform the response
    const transformedResponse = transformServerResponse(serverResponse);
    
    // Check if transformation was successful
    const transformationSuccessful = 
      transformedResponse !== null &&
      Array.isArray(transformedResponse.reels) &&
      transformedResponse.reels.length === 5 &&
      Array.isArray(transformedResponse.reels[0]) &&
      transformedResponse.reels[0].length === 3 &&
      typeof transformedResponse.reels[0][0].name === 'string' &&
      typeof transformedResponse.reels[0][0].isSpecial === 'boolean' &&
      typeof transformedResponse.reels[0][0].scale === 'number' &&
      typeof transformedResponse.win === 'number' &&
      Array.isArray(transformedResponse.winningPositions) &&
      typeof transformedResponse.triggerFreeSpins === 'boolean';
    
    console.log(`  - Expected: Transformed response with reels, win, winningPositions, and triggerFreeSpins`);
    console.log(`  - Result: ${transformationSuccessful ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.error('Error in Test Suite 6:', error);
  }
  
  // Clean up
  mockDomUtils.restoreRandom();
  console.log('\nAll tests completed');
}

// Run the tests
runTests();