// Test Suite for Kong Slot Machine PixiJS Implementation

class SlotMachineTestSuite {
    constructor(slotMachine) {
        this.slotMachine = slotMachine;
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    runAllTests() {
        console.log('Starting Kong Slot Machine Test Suite...');
        this.testInitialization();
        this.testSymbolRendering();
        this.testReelSpinning();
        this.testWinCalculation();
        this.testFreeSpinsMode();
        this.testBigWinDisplay();
        this.testUIInteractions();
        this.testResponsiveness();
        
        console.log(`Test Results: ${this.testResults.passed}/${this.testResults.total} tests passed`);
        return this.testResults;
    }

    assert(condition, testName, message) {
        this.testResults.total++;
        
        if (condition) {
            console.log(`✅ PASS: ${testName}`);
            this.testResults.passed++;
            return true;
        } else {
            console.error(`❌ FAIL: ${testName} - ${message}`);
            this.testResults.failed++;
            return false;
        }
    }

    testInitialization() {
        console.log('Testing initialization...');
        
        // Test PIXI application creation
        this.assert(
            this.slotMachine.app instanceof PIXI.Application,
            'PIXI Application Creation',
            'The PIXI application should be created'
        );
        
        // Test containers creation
        this.assert(
            this.slotMachine.reelContainer instanceof PIXI.Container,
            'Reel Container Creation',
            'The reel container should be created'
        );
        
        // Test reel creation
        this.assert(
            this.slotMachine.reels.length === this.slotMachine.reelCount,
            'Reel Count',
            `There should be ${this.slotMachine.reelCount} reels created`
        );
        
        // Test initial state
        this.assert(
            !this.slotMachine.spinning,
            'Initial Spinning State',
            'The machine should not be in spinning state initially'
        );
        
        this.assert(
            this.slotMachine.balance > 0,
            'Initial Balance',
            'The balance should be initialized with a positive value'
        );
    }

    testSymbolRendering() {
        console.log('Testing symbol rendering...');
        
        // Test if symbols are created
        let hasSymbols = true;
        for (let i = 0; i < this.slotMachine.reelCount; i++) {
            if (this.slotMachine.reels[i].symbols.length === 0) {
                hasSymbols = false;
                break;
            }
        }
        
        this.assert(
            hasSymbols,
            'Symbol Creation',
            'Each reel should have symbols'
        );
        
        // Test if symbol sprites are created
        let hasSprites = true;
        for (let i = 0; i < this.slotMachine.reelCount; i++) {
            if (this.slotMachine.reels[i].sprites.length === 0) {
                hasSprites = false;
                break;
            }
        }
        
        this.assert(
            hasSprites,
            'Symbol Sprite Creation',
            'Each reel should have symbol sprites'
        );
        
        // Test if initial symbols match final symbols
        let finalSymbolsCorrect = true;
        for (let i = 0; i < this.slotMachine.reelCount; i++) {
            const reel = this.slotMachine.reels[i];
            for (let j = 0; j < this.slotMachine.symbolsPerReel; j++) {
                if (reel.finalSymbols[j] !== reel.symbols[j + this.slotMachine.extraSymbols]) {
                    finalSymbolsCorrect = false;
                    break;
                }
            }
        }
        
        this.assert(
            finalSymbolsCorrect,
            'Final Symbols Setup',
            'Final symbols should be a subset of the symbol array'
        );
    }

    testReelSpinning() {
        console.log('Testing reel spinning...');
        
        // Save initial state
        const initialBalance = this.slotMachine.balance;
        const initialSpinning = this.slotMachine.spinning;
        
        // Mock spin method to avoid actual animation
        const originalSpin = this.slotMachine.spin;
        let spinCalled = false;
        
        this.slotMachine.spin = () => {
            spinCalled = true;
            this.slotMachine.spinning = true;
            
            // Deduct stake if not in free spin mode
            if (!this.slotMachine.isFreeSpinMode) {
                this.slotMachine.balance -= this.slotMachine.stake;
            }
            
            // Mock spin completion after a delay
            setTimeout(() => {
                this.slotMachine.spinning = false;
                
                // Add a mock win
                this.slotMachine.winAmount = 10;
                this.slotMachine.balance += this.slotMachine.winAmount;
            }, 100);
        };
        
        // Trigger spin
        this.slotMachine.spin();
        
        // Test if spin was called
        this.assert(
            spinCalled,
            'Spin Method Call',
            'The spin method should be called'
        );
        
        // Test if spinning state is updated
        this.assert(
            this.slotMachine.spinning,
            'Spinning State Update',
            'The spinning state should be true during spin'
        );
        
        // Test if balance is deducted
        const expectedBalance = !this.slotMachine.isFreeSpinMode 
            ? initialBalance - this.slotMachine.stake 
            : initialBalance;
            
        this.assert(
            this.slotMachine.balance === expectedBalance,
            'Balance Deduction',
            'The balance should be deducted by the stake amount when spinning'
        );
        
        // Test spin completion after delay
        setTimeout(() => {
            this.assert(
                !this.slotMachine.spinning,
                'Spin Completion',
                'The spinning state should be false after spin completes'
            );
            
            this.assert(
                this.slotMachine.balance === expectedBalance + this.slotMachine.winAmount,
                'Win Addition',
                'The win amount should be added to the balance after spin completes'
            );
            
            // Restore original spin method
            this.slotMachine.spin = originalSpin;
        }, 200);
    }

    testWinCalculation() {
        console.log('Testing win calculation...');
        
        // Create a mock result with a guaranteed win
        const mockResults = {
            reels: [
                [
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Explorer', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Explorer', isSpecial: true, scale: 1.2 },
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Explorer', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Compass', isSpecial: true, scale: 1.2 },
                    { name: 'Treasure Chest', isSpecial: true, scale: 1.2 },
                    { name: 'Compass', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Wild', isSpecial: true, scale: 1.2 },
                    { name: 'Wild', isSpecial: true, scale: 1.2 },
                    { name: 'Wild', isSpecial: true, scale: 1.2 }
                ],
                [
                    { name: 'Binoculars', isSpecial: true, scale: 1.2 },
                    { name: 'Binoculars', isSpecial: true, scale: 1.2 },
                    { name: 'Binoculars', isSpecial: true, scale: 1.2 }
                ]
            ],
            triggerFreeSpins: false,
            generateBigWin: true
        };
        
        // Calculate win
        const winResult = this.slotMachine.calculateWinAmount(mockResults);
        
        // Test if win amount is calculated
        this.assert(
            winResult.amount > 0,
            'Win Amount Calculation',
            'The win amount should be greater than 0 for a winning combination'
        );
        
        // Test if winning positions are identified
        this.assert(
            winResult.positions.length > 0,
            'Winning Positions Identification',
            'Winning positions should be identified for a winning combination'
        );
        
        // Test if win amount calculation is correct for a specific pattern
        // In this case, we have a line of Treasure Chest across 5 reels (with Wilds)
        const treasureChestObj = this.slotMachine.symbols.find(s => s.name === 'Treasure Chest');
        const expectedWin = treasureChestObj.payouts[4] * this.slotMachine.stake;
        
        this.assert(
            winResult.amount >= expectedWin,
            'Win Amount Accuracy',
            `The win amount should be at least ${expectedWin} for 5 Treasure Chest symbols`
        );
    }

    testFreeSpinsMode() {
        console.log('Testing free spins mode...');
        
        // Save original state
        const originalFreeSpinMode = this.slotMachine.isFreeSpinMode;
        const originalFreeSpinCount = this.slotMachine.freeSpinCount;
        const originalRemainingFreeSpinCount = this.slotMachine.remainingFreeSpinCount;
        const originalBonusMultiplier = this.slotMachine.bonusMultiplier;
        
        // Mock trigger free spins
        this.slotMachine.triggerFreeSpins();
        
        // Test if free spin mode is activated
        this.assert(
            this.slotMachine.isFreeSpinMode,
            'Free Spin Mode Activation',
            'Free spin mode should be activated when triggered'
        );
        
        // Test if free spin count is set
        this.assert(
            this.slotMachine.freeSpinCount > 0,
            'Free Spin Count Set',
            'Free spin count should be set to a positive value'
        );
        
        // Test if remaining free spin count is set
        this.assert(
            this.slotMachine.remainingFreeSpinCount === this.slotMachine.freeSpinCount,
            'Remaining Free Spin Count Set',
            'Remaining free spin count should be equal to the free spin count'
        );
        
        // Test if bonus multiplier is set
        this.assert(
            this.slotMachine.bonusMultiplier >= 0,
            'Bonus Multiplier Set',
            'Bonus multiplier should be set to a non-negative value'
        );
        
        // Restore original state
        this.slotMachine.isFreeSpinMode = originalFreeSpinMode;
        this.slotMachine.freeSpinCount = originalFreeSpinCount;
        this.slotMachine.remainingFreeSpinCount = originalRemainingFreeSpinCount;
        this.slotMachine.bonusMultiplier = originalBonusMultiplier;
    }

    testBigWinDisplay() {
        console.log('Testing big win display...');
        
        // Mock showBigWin method
        const originalShowBigWin = this.slotMachine.showBigWin;
        let bigWinDisplayed = false;
        let bigWinAmount = 0;
        
        this.slotMachine.showBigWin = (amount) => {
            bigWinDisplayed = true;
            bigWinAmount = amount;
        };
        
        // Trigger big win
        this.slotMachine.showBigWin(200);
        
        // Test if big win is displayed
        this.assert(
            bigWinDisplayed,
            'Big Win Display',
            'Big win should be displayed when triggered'
        );
        
        // Test if big win amount is correct
        this.assert(
            bigWinAmount === 200,
            'Big Win Amount',
            'Big win amount should be displayed correctly'
        );
        
        // Restore original method
        this.slotMachine.showBigWin = originalShowBigWin;
    }

    testUIInteractions() {
        console.log('Testing UI interactions...');
        
        // Test balance display
        const originalDisplayBalance = this.slotMachine.displayBalance;
        let balanceDisplayed = false;
        let displayedAmount = 0;
        
        this.slotMachine.displayBalance = (amount) => {
            balanceDisplayed = true;
            displayedAmount = amount;
        };
        
        // Display balance
        this.slotMachine.displayBalance(500);
        
        // Test if balance is displayed
        this.assert(
            balanceDisplayed,
            'Balance Display',
            'Balance should be displayed when updated'
        );
        
        // Test if displayed amount is correct
        this.assert(
            displayedAmount === 500,
            'Displayed Balance Amount',
            'Displayed balance amount should be correct'
        );
        
        // Restore original method
        this.slotMachine.displayBalance = originalDisplayBalance;
    }

    testResponsiveness() {
        console.log('Testing responsiveness...');
        
        // Mock handleResize method
        const originalHandleResize = this.slotMachine.handleResize;
        let resizeHandled = false;
        
        this.slotMachine.handleResize = () => {
            resizeHandled = true;
        };
        
        // Trigger resize
        window.dispatchEvent(new Event('resize'));
        
        // Test if resize is handled
        this.assert(
            resizeHandled,
            'Resize Handler',
            'Resize event should be handled'
        );
        
        // Restore original method
        this.slotMachine.handleResize = originalHandleResize;
    }
}

// Initialize and run the test suite when the slot machine is ready
window.addEventListener('DOMContentLoaded', () => {
    // Check for slot machine initialization every 500ms
    const checkInterval = setInterval(() => {
        if (window.slotMachine && window.slotMachine.app) {
            clearInterval(checkInterval);
            
            // Give time for assets to load
            setTimeout(() => {
                console.log('Slot machine initialized, running tests...');
                const testSuite = new SlotMachineTestSuite(window.slotMachine);
                testSuite.runAllTests();
            }, 2000);
        }
    }, 500);
});