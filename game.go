### pkg/games/kong/game.go

go
package kong

import (
	"log"
	"math/rand"
	"runtime"
	"sync"
	"time"
)

// Symbol represents a symbol on the reels
type Symbol string

const (
	SymbolTreasureChest Symbol = "Treasure Chest"
	SymbolExplorer      Symbol = "Explorer"
	SymbolCompass       Symbol = "Compass"
	SymbolBinoculars    Symbol = "Binoculars"
	SymbolA             Symbol = "A"
	SymbolK             Symbol = "K"
	SymbolQ             Symbol = "Q"
	SymbolJ             Symbol = "J"
	SymbolWild          Symbol = "Wild"
	SymbolScatter       Symbol = "Scatter"
)

// Paytable defines the payouts for each symbol
var Paytable = map[Symbol]map[int]float64{
	SymbolTreasureChest: {3: 40, 4: 100, 5: 250},
	SymbolExplorer:      {3: 30, 4: 80, 5: 200},
	SymbolCompass:       {3: 25, 4: 60, 5: 175},
	SymbolBinoculars:    {3: 20, 4: 50, 5: 150},
	SymbolA:             {3: 10, 4: 20, 5: 100},
	SymbolK:             {3: 8, 4: 15, 5: 90},
	SymbolQ:             {3: 6, 4: 12, 5: 80},
	SymbolJ:             {3: 5, 4: 10, 5: 70},
}

// AllSymbols is the list of symbols that can appear on the reels
var AllSymbols = []Symbol{
	SymbolTreasureChest,
	SymbolExplorer,
	SymbolCompass,
	SymbolBinoculars,
	SymbolA,
	SymbolK,
	SymbolQ,
	SymbolJ,
	SymbolWild,
	SymbolScatter,
}

// ReelConfig defines the symbols allowed on each reel
var ReelConfig = map[int][]Symbol{
	1: {SymbolTreasureChest, SymbolExplorer, SymbolCompass, SymbolBinoculars, SymbolA, SymbolK, SymbolQ, SymbolJ, SymbolScatter},
	2: {SymbolTreasureChest, SymbolExplorer, SymbolCompass, SymbolBinoculars, SymbolA, SymbolK, SymbolQ, SymbolJ, SymbolWild, SymbolScatter},
	3: {SymbolTreasureChest, SymbolExplorer, SymbolCompass, SymbolBinoculars, SymbolA, SymbolK, SymbolQ, SymbolJ, SymbolWild, SymbolScatter},
	4: {SymbolTreasureChest, SymbolExplorer, SymbolCompass, SymbolBinoculars, SymbolA, SymbolK, SymbolQ, SymbolJ, SymbolWild, SymbolScatter},
	5: {SymbolTreasureChest, SymbolExplorer, SymbolCompass, SymbolBinoculars, SymbolA, SymbolK, SymbolQ, SymbolJ, SymbolWild, SymbolScatter},
}

// NonWinningSymbols is a subset of symbols that can be used to force a loss
var NonWinningSymbols = []Symbol{
	SymbolA,
	SymbolK,
	SymbolQ,
	SymbolJ,
}

// WinData represents the data for a winning combination
type WinData struct {
	Symbol    Symbol
	Count     int
	Ways      int
	WinAmount float64
	Positions [][]int
}

// Denomination for normal spins
const Denomination = 0.01

// generateSingleReelSet generates a single 5x3 grid of symbols
func generateSingleReelSet() [][]string {
	reels := make([][]string, 5)
	for i := 0; i < 5; i++ {
		reels[i] = make([]string, 3)
	}

	for reel := 0; reel < 5; reel++ {
		allowedSymbols := ReelConfig[reel+1]
		for row := 0; row < 3; row++ {
			reels[reel][row] = string(allowedSymbols[rand.Intn(len(allowedSymbols))])
		}
	}

	return reels
}

// GenerateReels generates a 5x3 grid of symbols using concurrency
func GenerateReels(guaranteeWin bool) [][]string {
	// Determine the number of workers (goroutines) based on CPU cores
	numWorkers := runtime.NumCPU()
	if numWorkers < 1 {
		numWorkers = 1
	}

	// Channel to receive the first valid reel set
	resultChan := make(chan [][]string, 1)
	// Channel to signal workers to stop
	stopChan := make(chan struct{})
	// Ensure stopChan is closed only once
	var closeOnce sync.Once
	// WaitGroup to synchronize goroutines
	var wg sync.WaitGroup

	// Start workers
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			// Seed the random number generator uniquely for each goroutine
			rand.Seed(time.Now().UnixNano() + int64(workerID))

			attempts := 0
			for {
				attempts++
				select {
				case <-stopChan:
					log.Printf("Worker %d stopping after %d attempts", workerID, attempts)
					return
				default:
					// Generate a reel set
					reels := generateSingleReelSet()
					winAmount, _ := CalculateRegularWin(reels, false, 1, 0) // Use default values for checking win

					if guaranteeWin {
						// We need a win
						if winAmount > 0 {
							log.Printf("Worker %d found a winning reel set after %d attempts: %v, winAmount: %f", workerID, attempts, reels, winAmount)
							select {
							case resultChan <- reels:
								closeOnce.Do(func() {
									close(stopChan) // Close stopChan only once
								})
								return
							case <-stopChan:
								log.Printf("Worker %d stopping after %d attempts (stopChan received)", workerID, attempts)
								return
							}
						}
					} else {
						// We need a loss
						if winAmount == 0 {
							// Occasionally add Scatters to allow for free spin triggers
							for reel := 0; reel < 5; reel++ {
								for row := 0; row < 3; row++ {
									if rand.Float32() < 0.1 { // 10% chance of a Scatter
										reels[reel][row] = string(SymbolScatter)
									}
								}
							}
							// Recheck the win amount after adding Scatters
							winAmount2, _ := CalculateRegularWin(reels, false, 1, 0)
							if winAmount2 == 0 {
								log.Printf("Worker %d found a losing reel set after %d attempts: %v", workerID, attempts, reels)
								select {
								case resultChan <- reels:
									closeOnce.Do(func() {
										close(stopChan) // Close stopChan only once
									})
									return
								case <-stopChan:
									log.Printf("Worker %d stopping after %d attempts (stopChan received)", workerID, attempts)
									return
								}
							}
						}
					}
				}
			}
		}(i)
	}

	// Wait for a result
	reels := <-resultChan

	// Ensure all workers stop
	wg.Wait()
	close(resultChan)

	// Verify the win condition
	if guaranteeWin {
		winAmount, _ := CalculateRegularWin(reels, false, 1, 0)
		if winAmount <= 0 {
			log.Printf("Error: Generated reels do not have a win despite guaranteeWin=true: %v", reels)
			// Force a simple win as a fallback, starting from Reel 0
			reels = generateSingleReelSet()
			// Force a win: 3 matching symbols on reels 0, 1, and 2 in a random row
			winningSymbol := SymbolTreasureChest
			row := rand.Intn(3) // Random row
			reels[0][row] = string(winningSymbol)
			reels[1][row] = string(winningSymbol)
			reels[2][row] = string(winningSymbol)
			winAmount, _ = CalculateRegularWin(reels, false, 1, 0)
			log.Printf("Forced a win in row %d: %v, winAmount: %f", row, reels, winAmount)
		}
	}

	return reels
}

// func CalculateRegularWin(reels [][]string, isFreeSpin bool, betMultiplier int, bonusMultiplier int) float64 {
// 	totalWin := 0.0

// 	// Map to store the longest count for each symbol
// 	winCounts := make(map[Symbol]int) // Symbol -> Longest Count
// 	// Map to store the number of matches on each reel for each symbol
// 	matchesPerReel := make(map[Symbol][]int) // Symbol -> [Reel] -> Number of Matches

// 	// Initialize the maps for each symbol
// 	for symbol := range Paytable {
// 		winCounts[symbol] = 0
// 		matchesPerReel[symbol] = make([]int, 5)
// 		// Count matches on each reel
// 		for reel := 0; reel < 5; reel++ {
// 			matches := 0
// 			for row := 0; row < 3; row++ {
// 				if reels[reel][row] == string(symbol) || reels[reel][row] == string(SymbolWild) {
// 					matches++
// 				}
// 			}
// 			matchesPerReel[symbol][reel] = matches
// 		}
// 	}

// 	// Check all 243 ways to win to determine the longest consecutive match for each symbol
// 	for row1 := 0; row1 < 3; row1++ {
// 		for row2 := 0; row2 < 3; row2++ {
// 			for row3 := 0; row3 < 3; row3++ {
// 				for row4 := 0; row4 < 3; row4++ {
// 					for row5 := 0; row5 < 3; row5++ {
// 						path := []string{
// 							reels[0][row1],
// 							reels[1][row2],
// 							reels[2][row3],
// 							reels[3][row4],
// 							reels[4][row5],
// 						}
// 						symbol, count := calculateLongestMatch(path)
// 						if count >= 3 && symbol != SymbolScatter && symbol != SymbolWild {
// 							if count > winCounts[symbol] {
// 								winCounts[symbol] = count
// 							}
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}

// 	// Calculate the total win for each symbol based on the longest count
// 	for symbol, count := range winCounts {
// 		if count >= 3 {
// 			// Calculate the number of ways for this count
// 			ways := 1
// 			for reel := 0; reel < count; reel++ {
// 				ways *= matchesPerReel[symbol][reel]
// 			}
// 			if ways > 0 {
// 				if payout, exists := Paytable[symbol]; exists {
// 					if baseWin, ok := payout[count]; ok {
// 						win := baseWin
// 						if isFreeSpin {
// 							win *= Denomination
// 							win *= float64(betMultiplier)
// 							win *= float64(ways)
// 							win *= float64(bonusMultiplier)
// 						} else {
// 							win *= Denomination
// 							win *= float64(betMultiplier)
// 							win *= float64(ways)
// 						}
// 						totalWin += win
// 						log.Printf("Win for %s (count=%d, ways=%d): %f", symbol, count, ways, win)
// 					}
// 				}
// 			}
// 		}
// 	}

// 	return totalWin
// }

// CalculateRegularWin calculates the win amount and returns winning positions
func CalculateRegularWin(reels [][]string, isFreeSpin bool, betMultiplier int, bonusMultiplier int) (float64, []WinningPosition) {
	totalWin := 0.0
	var winningPositions []WinningPosition

	// For each symbol in the paytable, check for wins
	for symbol, payouts := range Paytable {
		// Find positions for this symbol or wild on each reel
		positions := make([][]int, 5)
		for reel := 0; reel < 5; reel++ {
			for row := 0; row < 3; row++ {
				if reels[reel][row] == string(symbol) || reels[reel][row] == string(SymbolWild) {
					positions[reel] = append(positions[reel], row)
				}
			}
		}
		
		// Check for consecutive symbols from left to right
		maxConsecutive := 0
		for i := 0; i < 5; i++ {
			if len(positions[i]) > 0 {
				maxConsecutive = i + 1
			} else {
				break
			}
		}
		
		// If we have at least 3 consecutive symbols, it's a win
		if maxConsecutive >= 3 {
			// Calculate ways (multiply the number of symbols on each reel)
			ways := 1
			for i := 0; i < maxConsecutive; i++ {
				ways *= len(positions[i])
			}
			
			// Look up the win amount in the paytable
			if baseWin, ok := payouts[maxConsecutive]; ok {
				// Calculate total win
				win := baseWin
				if isFreeSpin {
					win *= Denomination
					win *= float64(betMultiplier)
					win *= float64(ways)
					win *= float64(bonusMultiplier)
				} else {
					win *= Denomination
					win *= float64(betMultiplier)
					win *= float64(ways)
				}
				totalWin += win
				
				log.Printf("Win for %s (count=%d, ways=%d): %f", symbol, maxConsecutive, ways, win)
				
				// Add all contributing positions to winning positions
				for reel := 0; reel < maxConsecutive; reel++ {
					for _, row := range positions[reel] {
						winningPositions = append(winningPositions, WinningPosition{
							Symbol:   reels[reel][row], // Use actual symbol (could be wild)
							Reel:     reel,
							Row:      row,
							Count:    maxConsecutive,
							Ways:     ways,
							WinValue: win, // Full win value
						})
					}
				}
			}
		}
	}

	return totalWin, winningPositions
}

// // calculateLongestMatch determines the longest consecutive match for a single path
// func calculateLongestMatch(symbols []string) (Symbol, int) {
// 	// The winning symbol must start from Reel 0
// 	currentSymbol := symbols[0]
// 	if currentSymbol == string(SymbolScatter) || currentSymbol == string(SymbolWild) {
// 		return SymbolScatter, 0 // No win if Reel 0 is Scatter or Wild
// 	}

// 	// Count the longest consecutive matches starting from Reel 0
// 	count := 1
// 	for i := 1; i < len(symbols); i++ {
// 		if symbols[i] == string(SymbolScatter) {
// 			break // Scatter breaks the sequence
// 		}
// 		if symbols[i] == string(SymbolWild) || symbols[i] == currentSymbol {
// 			count++
// 		} else {
// 			break // Non-matching symbol breaks the sequence
// 		}
// 	}

// 	if count < 3 {
// 		return SymbolScatter, 0 // Need at least 3 symbols to win
// 	}

// 	return Symbol(currentSymbol), count
// }

// CountScatters counts the number of Scatters on the reels
func CountScatters(reels [][]string) int {
	count := 0
	for reel := 0; reel < 5; reel++ {
		for row := 0; row < 3; row++ {
			if reels[reel][row] == string(SymbolScatter) {
				count++
			}
		}
	}
	return count
}

// HasScatterOnEachReel checks if there's at least one Scatter on each reel
func HasScatterOnEachReel(reels [][]string) bool {
	for reel := 0; reel < 5; reel++ {
		hasScatter := false
		for row := 0; row < 3; row++ {
			if reels[reel][row] == string(SymbolScatter) {
				hasScatter = true
				break
			}
		}
		if !hasScatter {
			return false
		}
	}
	return true
}

// GetBonusMultiplier returns the bonus multiplier based on the number of Scatters
func GetBonusMultiplier(scatterCount int) int {
	switch scatterCount {
	case 5:
		return 3
	case 6:
		return 6
	case 7:
		return 9
	case 8:
		return 18
	case 9:
		return 36
	case 10:
		return 72
	default:
		return 0
	}
}

func init() {
	rand.Seed(time.Now().UnixNano())
}



### pkg/games/kong/handlers.go

go
package kong

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func (rg *RouteGroup) SpinHandler(c *fiber.Ctx) error {
	// Parse the request
	var req SpinRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("Error parsing request body: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(SpinResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
	}

	// Define allowed bet amounts and their corresponding multipliers
	betMultipliers := map[float64]int{
		0.3: 1,
		0.6: 2,
		0.9: 3,
		1.5: 5,
		3.0: 10,
	}

	// Validate the request
	if req.BetAmount <= 0 && !req.IsFreeSpin {
		log.Printf("Validation error: Bet amount must be positive")
		return c.Status(fiber.StatusBadRequest).JSON(SpinResponse{
			Status:  "error",
			Message: "Bet amount must be positive",
		})
	}
	if req.IsFreeSpin && req.FreeSpinCount <= 0 {
		log.Printf("Validation error: Free spin count must be positive")
		return c.Status(fiber.StatusBadRequest).JSON(SpinResponse{
			Status:  "error",
			Message: "Free spin count must be positive",
		})
	}
	if req.IsFreeSpin && req.OriginalBetAmount <= 0 {
		log.Printf("Validation error: Original bet amount must be positive")
		return c.Status(fiber.StatusBadRequest).JSON(SpinResponse{
			Status:  "error",
			Message: "Original bet amount must be positive",
		})
	}

	// Validate bonus multiplier during free spins
	if req.IsFreeSpin && req.BonusMultiplier <= 0 {
		log.Printf("Warning: Bonus multiplier is 0 during free spins, setting to default value (3)")
		req.BonusMultiplier = 3
	}

	// Validate bet amount for normal spins
	if !req.IsFreeSpin {
		if _, exists := betMultipliers[req.BetAmount]; !exists {
			log.Printf("Validation error: Invalid bet amount %f, allowed values are 0.3, 0.6, 0.9, 1.5, 3.0", req.BetAmount)
			return c.Status(fiber.StatusBadRequest).JSON(SpinResponse{
				Status:  "error",
				Message: "Invalid bet amount, allowed values are 0.3, 0.6, 0.9, 1.5, 3.0",
			})
		}
	}

	// Get the bet multiplier for normal spins
	betMultiplier := 1 // Default for free spins (not used)
	if !req.IsFreeSpin {
		betMultiplier = betMultipliers[req.BetAmount]
	}
	log.Printf("Bet multiplier: %d", betMultiplier)

	// Call the Settings API to get RTP
	rtp, err := rg.Settings.GetRTP(req.ClientID, req.GameID, req.PlayerID)
	if err != nil {
		log.Printf("Error retrieving game settings: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(SpinResponse{
			Status:  "error",
			Message: "Failed to retrieve game settings: " + err.Error(),
		})
	}
	log.Printf("Retrieved RTP: %f", rtp)

	// Generate reels with a guaranteed win
	reels := GenerateReels(true)
	log.Printf("Generated reels: %v", reels)

	// Calculate potential win and winning positions
	potentialWin, winningPositions := CalculateRegularWin(reels, req.IsFreeSpin, betMultiplier, req.BonusMultiplier)
	log.Printf("Potential win: %f", potentialWin)
	log.Printf("Winning positions: %v", winningPositions)

	// Calculate payout multiplier
	betAmountForPayout := req.BetAmount
	if req.IsFreeSpin {
		betAmountForPayout = req.OriginalBetAmount
	}
	payoutMultiplier := potentialWin / betAmountForPayout
	log.Printf("Payout multiplier: %f", payoutMultiplier)

	// Call the RNG API
	rngResp, err := rg.RNG.GetOutcome(req.ClientID, req.GameID, req.PlayerID, rtp, payoutMultiplier, betAmountForPayout)
	if err != nil {
		log.Printf("Error retrieving RNG outcome: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(SpinResponse{
			Status:  "error",
			Message: "Failed to retrieve RNG outcome: " + err.Error(),
		})
	}
	log.Printf("RNG outcome: %s", rngResp.PrefOutcome)

	// Apply the RNG outcome
	winAmount := potentialWin
	if rngResp.PrefOutcome == "loss" {
		// Force a sensical loss (no winning combinations)
		reels = GenerateReels(false)
		log.Printf("Forced loss, new reels: %v", reels)
		winAmount = 0
		winningPositions = []WinningPosition{}
	}

	// Check for Free Spin Bonus trigger/retrigger
	freeSpinTriggered := false
	newFreeSpinCount := req.FreeSpinCount
	newBonusMultiplier := req.BonusMultiplier
	newIsFreeSpin := req.IsFreeSpin

	if HasScatterOnEachReel(reels) {
		freeSpinTriggered = true
		scatterCount := CountScatters(reels)
		newBonusMultiplier = GetBonusMultiplier(scatterCount)
		if newIsFreeSpin {
			// Retrigger
			newFreeSpinCount += 13
			if newFreeSpinCount > 100 {
				newFreeSpinCount = 100
			}
		} else {
			// Initial trigger
			newFreeSpinCount = 13
			newIsFreeSpin = true
		}
		log.Printf("Free spin triggered/retriggered: scatterCount=%d, newFreeSpinCount=%d, newBonusMultiplier=%d", scatterCount, newFreeSpinCount, newBonusMultiplier)
	}

	// // Add scatter positions to winning positions when free spins are triggered
	// for reel := 0; reel < 5; reel++ {
	// 	for row := 0; row < 3; row++ {
	// 		if reels[reel][row] == string(SymbolScatter) {
	// 			winningPositions = append(winningPositions, WinningPosition{
	// 				Symbol:   string(SymbolScatter),
	// 				Reel:     reel,
	// 				Row:      row,
	// 				Count:    scatterCount,
	// 				Ways:     1,
	// 				WinValue: 0, // Scatters don't have direct win value, but trigger free spins
	// 			})
	// 		}
	// 	}
	// }

	// Update free spin state
	if newIsFreeSpin {
		// Only decrement if the player was already in free spin mode
		if req.IsFreeSpin {
			newFreeSpinCount--
			if newFreeSpinCount <= 0 {
				newIsFreeSpin = false
				newBonusMultiplier = 0
			}
		}

	}

	// Build the response
	response := SpinResponse{
		Status:            "success",
		Message:           "",
		Reels:             reels,
		WinAmount:         winAmount,
		IsFreeSpin:        newIsFreeSpin,
		FreeSpinCount:     newFreeSpinCount,
		BonusMultiplier:   newBonusMultiplier,
		FreeSpinTriggered: freeSpinTriggered,
		WinningPositions:  winningPositions,
	}

	return c.JSON(response)
}

