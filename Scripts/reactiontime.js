// DOM elements
let container, countdownDisplay, resultDisplay;
let startTime, startdelay, endTime, timeoutId;
let isWaiting = false;
let isTestActive = false;

// Initialize immediately and also on DOM content loaded
initializeReactionTest();

document.addEventListener("DOMContentLoaded", initializeReactionTest);
// Add listener for dynamic page loads if using any routing/navigation system
document.addEventListener("load", initializeReactionTest);

function initializeReactionTest() {
  container = document.getElementById("reaction-container");
  countdownDisplay = document.getElementById("countdown-display");
  resultDisplay = document.getElementById("result-display");

  // Remove existing listener first to prevent duplicates
  if (container) {
    container.removeEventListener("click", handleClick);
    container.addEventListener("click", handleClick);
  }
}

function startReactionTest() {
  countdownDisplay.textContent = "Wait for green...";
  resultDisplay.textContent = "";

  // Reduced max delay to 3 seconds and min to 0.5 seconds for better user experience
  const delay = 500 + Math.random() * 2500;

  // Use requestAnimationFrame for better timing precision
  const startWait = performance.now();
  const waitUntil = startWait + delay;

  function checkTime() {
    if (performance.now() >= waitUntil) {
      isWaiting = false;
      isTestActive = true;
      container.classList.remove("waiting-bg");
      container.classList.add("success-bg");
      countdownDisplay.textContent = "Click!";
      startTime = performance.now();
    } else {
      requestAnimationFrame(checkTime);
    }
  }

  requestAnimationFrame(checkTime);
}

function endTest() {
  if (!isTestActive) return;

  endTime = performance.now();
  const rawReactionTime = endTime - startTime;

  // Reduced system latency compensation - modern browsers have better input handling
  const systemLatency = 95; // Approximate display refresh time (60Hz)
  const adjustedReactionTime = Math.max(
    0,
    Math.round(rawReactionTime - systemLatency)
  );

  // Update display using requestAnimationFrame for smoother updates
  requestAnimationFrame(() => {
    container.classList.remove("success-bg");
    countdownDisplay.textContent = `${adjustedReactionTime}ms`;
    resultDisplay.textContent = "Click to try again";
  });

  isTestActive = false;
}

function handleClick() {
  if (isTestActive) {
    endTest();
  } else if (!isWaiting) {
    isWaiting = true;
    container.classList.add("waiting-bg");
    startReactionTest();
  }
}
