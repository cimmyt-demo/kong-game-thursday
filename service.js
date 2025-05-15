const serverLink = "https://admin-api3.ibibe.africa";

let playerInfo = {
    id: "284",
    names: "",
    msisdn: "",
    account_number: "",
    email_address: "",
    is_blacklisted: "",
    wallet_balance: 0.00,
    created_at: "",
    last_bet_date: "",
    last_win_date: "",
    is_set: false
};

let gameInfo = {
    game_id: "46",
    client_id: "279",
}

let lastPlacedBetData = {
    player_id: "",
    amount: "",
    bet_id: "",
    client_id: "",
    game_id: ""
}

// Fetch player information
async function fetchPlayerInfo(playerId) {
    try {
        const response = await fetch(`${serverLink}/api/v1/customer/details?customer_id=${playerId}`);
        const data = await response.json();

        console.log(data)
    
        playerInfo = {
            id: data.id || "",
            names: data.names || "",
            msisdn: data.msisdn || "",
            account_number: data.account_number || "",
            email_address: data.email_address || "",
            is_blacklisted: data.is_blacklisted || "",
            wallet_balance: data.wallet_balance || 0.00,
            created_at: data.created_at || "",
            last_bet_date: data.last_bet_date || "",
            last_win_date: data.last_win_date || "",
            is_set: true
        };
    
        console.log("Player Info Fetched:", playerInfo);
    } catch (error) {
        console.error("Failed to fetch player info:", error);
    }
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
}
  
  

// Place a bet
async function placeBet(amount) {
    if (playerInfo.wallet_balance < amount) {
        console.log("Insufficient balance");
        return;
    }

    const betData = {
        player_id: playerInfo.id,
        amount: amount,
        bet_id: generateRandomString(10),
        client_id: gameInfo.client_id,
        game_id: gameInfo.game_id
    };

    try {
        const response = await fetch(`${serverLink}/api/v1/bet/place_bet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(betData)
        });
        const data = await response.json();
        console.log("Bet placed successfully:", data);
        lastPlacedBetData = betData;
        lastPlacedBetData.bet_id = data.bet_id;

    } catch (error) {
        lastPlacedBetData = {
            player_id: "",
            amount: "",
            bet_id: "",
            client_id: "",
            game_id: ""
        }
        console.error("Error placing bet:", error);
    }
}


// Add this function to transform the server response to match the expected format
function transformServerResponse(data) {
  // Check if the response is successful
  if (data.status !== "success") {
    console.error("Server returned error:", data.message)
    return null
  }

  // Transform the reels data structure
  // The server returns a 2D array where each inner array represents a column of symbols
  // We need to convert this to the format expected by our game
  const transformedReels = []

  // Process each reel (column)
  for (let i = 0; i < data.reels.length; i++) {
    const reelSymbols = []

    // Process each symbol in the reel
    for (let j = 0; j < data.reels[i].length; j++) {
      const symbolName = data.reels[i][j]

      // Find the symbol in the SYMBOLS array
      const symbolData = SYMBOLS.find((s) => s.name === symbolName)

      // Create a symbol object with fallback values if the symbol is not found
      reelSymbols.push({
        name: symbolName,
        isSpecial: true,
        scale: SYMBOL_SCALE_MAP[symbolName] || 1.2,
        // Add fallback properties from the SYMBOLS array or defaults
        color: symbolData ? symbolData.color : "#999999",
        normal_scale: symbolData ? symbolData.normal_scale : 1.2,
        z_index: symbolData ? symbolData.z_index : 5,
      })
    }

    transformedReels.push(reelSymbols)
  }

  // Return the transformed data in the format expected by our game
  return {
    reels: transformedReels,
    win: data.win_amount,
    winningPositions: data.winning_positions || [],
    triggerFreeSpins: data.free_spin_triggered,
    isFreeSpinMode: data.is_free_spin,
    freeSpinCount: data.free_spin_count,
    bonusMultiplier: data.bonus_multiplier,
  }
}


function updateBetDetails(win_amount) {
    const data = {
        bet_id: lastPlacedBetData.bet_id,
        amount_won: win_amount,
        client_id: gameInfo.client_id
    };

    const jsonString = JSON.stringify(data);

    fetch(serverLink + "/api/v1/update_bet", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: jsonString
    })
    .then(response => {
        console.log('------------------------------------')
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        console.log("Bet updated successfully:", data);
    })
    .catch(error => {
        console.error("Error updating bet:", error);
    });
}



fetchPlayerInfo(playerInfo.id)


