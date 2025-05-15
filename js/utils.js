// Function to get GIF duration
async function fetchGifAsBuffer(url) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return arrayBuffer
  }
  
  async function getGifDuration(url) {
    // Using gifuct library from global scope
    const arrayBuffer = await fetchGifAsBuffer(url)
    // Access gifuct as a global variable since it's loaded via script tag
    const gif = window.gifuct.parseGIF(arrayBuffer)
    const frames = window.gifuct.decompressFrames(gif, true)
  
    const duration = frames.reduce((total, frame) => {
      const delay = frame.delay || 10 // in hundredths of a second
      return total + delay * 10 // convert to milliseconds
    }, 0)
  
    return duration
  }
  
  async function onGifFinish(url, callback) {
    try {
      const duration = await getGifDuration(url)
      console.log(`GIF duration: ${duration}ms`)
      setTimeout(callback, duration)
    } catch (error) {
      console.error("Error determining GIF duration:", error)
      // Fallback to a reasonable default
      setTimeout(callback, 4500)
    }
  }
  
  // Function to determine win level based on amount
  function getWinLevel(amount) {
    if (amount < 100) {
      return "big"
    } else if (amount < 1000) {
      return "mega"
    } else {
      return "ultra"
    }
  }
  
  // Function to update win amount counter with animation
  function updateWinnings(targetAmount) {
    const element = document.getElementById("update_winnings")
    let currentAmount = Number.parseFloat(element.innerHTML) || 0
    const increment = (targetAmount - currentAmount) / 50 // Adjust speed
  
    const counter = setInterval(() => {
      currentAmount += increment
      element.innerHTML = `${currentAmount.toFixed(2)}`
  
      if ((increment > 0 && currentAmount >= targetAmount) || (increment < 0 && currentAmount <= targetAmount)) {
        element.innerHTML = `${targetAmount.toFixed(2)}`
        clearInterval(counter)
      }
    }, 20) // Update every 20ms
  }
  
  // Function to update the loader progress
  function updateLoaderProgress() {
    const loaderBar = document.getElementById("loader-bar")
    let progress = 0
  
    function incrementProgress() {
      progress += Math.random() * 10
      if (progress < 100) {
        loaderBar.style.width = progress + "%"
        setTimeout(incrementProgress, 200)
      } else {
        loaderBar.style.width = "100%"
        setTimeout(() => {
          document.querySelector(".loader-container").style.display = "none"
          document.getElementById("jdb_overlay").style.display = "none"
        }, 500)
      }
    }
  
    incrementProgress()
  }
  
  // Function to preload images
  function preloadImages(images) {
    images.forEach((src) => {
      const img = new Image()
      img.src = src
      img.crossOrigin = "anonymous"
    })
  }
  
  export {
    fetchGifAsBuffer,
    getGifDuration,
    onGifFinish,
    getWinLevel,
    updateWinnings,
    updateLoaderProgress,
    preloadImages,
  }
  