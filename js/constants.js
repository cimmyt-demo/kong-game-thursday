// Game constants
const KONG_SYMBOLS = {
    "Treasure Chest": {
      name: "Treasure Chest",
      image: "treasurechest.png",
      payouts: [0, 0, 40, 100, 250],
    },
    Explorer: {
      name: "Explorer",
      image: "explorer.png",
      payouts: [0, 0, 30, 80, 200],
    },
    Compass: {
      name: "Compass",
      image: "compass.png",
      payouts: [0, 0, 25, 60, 175],
    },
    Binoculars: {
      name: "Binoculars",
      image: "binoculars.png",
      payouts: [0, 0, 20, 50, 150],
    },
    A: {
      name: "A",
      image: "a.png",
      payouts: [0, 0, 10, 20, 100],
    },
    K: {
      name: "K",
      image: "k.png",
      payouts: [0, 0, 8, 15, 90],
    },
    Q: {
      name: "Q",
      image: "q.png",
      payouts: [0, 0, 6, 12, 80],
    },
    J: {
      name: "J",
      image: "j.png",
      payouts: [0, 0, 5, 10, 70],
    },
    Wild: {
      name: "Wild",
      image: "wild.png",
      payouts: [0, 0, 50, 125, 300],
    },
    Scatter: {
      name: "Scatter",
      image: "scatter.png",
      payouts: [0, 0, 5, 20, 50],
    },
  }
  
  // Bet levels
  const BET_LEVELS = [0.3, 0.6, 0.9, 1.5, 3.0]
  
  // Multiplier mapping for bet amounts
  const BET_MULTIPLIERS = {
    0.3: 1,
    0.6: 2,
    0.9: 3,
    1.5: 5,
    3.0: 10,
  }
  
  // Symbol definitions
  const SYMBOLS = [
    { name: "Treasure Chest", image: "treasurechest.png", multiplier: 2 },
    { name: "Explorer", image: "explorer.png", multiplier: 5 },
    { name: "Compass", image: "compass.png", multiplier: 5 },
    { name: "Binoculars", image: "binoculars.png", multiplier: 5 },
    { name: "A", image: "a.png", multiplier: 5 },
    { name: "K", image: "k.png", multiplier: 5 },
    { name: "Q", image: "q.png", multiplier: 5 },
    { name: "J", image: "j.png", multiplier: 5 },
    { name: "Wild", image: "wild.png", multiplier: 10 },
    { name: "Scatter", image: "scatter.png", multiplier: 3 },
  ]
  
  // Coin images for win animation
  const COIN_IMAGES = [
    "coins/0_BigWin_SS.png",
    "coins/1_BigWin_SS.png",
    "coins/2_BigWin_SS.png",
    "coins/3_BigWin_SS.png",
    "coins/4_BigWin_SS.png",
    "coins/5_BigWin_SS.png",
    "coins/6_BigWin_SS.png",
    "coins/7_BigWin_SS.png",
    "coins/8_BigWin_SS.png",
    "coins/9_BigWin_SS.png",
    "coins/10_BigWin_SS.png",
    "coins/11_BigWin_SS.png",
    "coins/12_BigWin_SS.png",
    "coins/13_BigWin_SS.png",
    "coins/14_BigWin_SS.png",
    "coins/15_BigWin_SS.png",
    "coins/16_BigWin_SS.png",
    "coins/17_BigWin_SS.png",
    "coins/18_BigWin_SS.png",
    "coins/19_BigWin_SS.png",
    "coins/20_BigWin_SS.png",
    "coins/21_BigWin_SS.png",
    "coins/22_BigWin_SS.png",
    "coins/23_BigWin_SS.png",
    "coins/24_BigWin_SS.png",
    "coins/25_BigWin_SS.png",
    "coins/26_BigWin_SS.png",
    "coins/27_BigWin_SS.png",
    "coins/28_BigWin_SS.png",
    "coins/29_BigWin_SS.png",
    "coins/30_BigWin_SS.png",
  ]
  
  // Win level configurations
  const WIN_LEVELS = {
    big: {
      imgSrc: "winlevels/bigwin.png",
      text: "BIG WIN",
      textClass: "big-win",
      sunburstClass: "big-win-color",
      threshold: 100,
      coinCount: 30,
    },
    mega: {
      imgSrc: "winlevels/megawin.gif",
      text: "MEGA WIN",
      textClass: "mega-win",
      sunburstClass: "mega-win-color",
      threshold: 1000,
      coinCount: 50,
    },
    ultra: {
      imgSrc: "winlevels/ultrawin.gif",
      text: "ULTRA WIN",
      textClass: "ultra-win",
      sunburstClass: "ultra-win-color",
      threshold: Number.POSITIVE_INFINITY,
      coinCount: 80,
    },
  }
  
  // Game configuration
  const GAME_CONFIG = {
    numReels: 5,
    numRows: 3,
    initialBalance: 1000,
    initialStake: 0.3,
    initialAutoSpins: 0,
  }
  
  // API configuration
  const API_CONFIG = {
    baseUrl: "https://b.api.ibibe.africa",
    endpoint: "/spin/kong",
    clientId: "1",
    gameId: "44",
    playerId: "22",
  }
  
  // Export all constants
  export { KONG_SYMBOLS, BET_LEVELS, BET_MULTIPLIERS, SYMBOLS, COIN_IMAGES, WIN_LEVELS, GAME_CONFIG, API_CONFIG }
  