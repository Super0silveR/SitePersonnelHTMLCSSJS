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

  // Random delay between 1-5 seconds
  const delay = 1000 + Math.random() * 4000;

  timeoutId = setTimeout(() => {
    isWaiting = false;
    isTestActive = true;
    container.classList.remove("waiting-bg");
    container.classList.add("success-bg");
    countdownDisplay.textContent = "Click!";
    // Use performance.now() for more precise timing
    startTime = performance.now();
    startdelay = performance.now();
  }, delay);
}

function endTest() {
  if (!isTestActive) {
    // ... existing error handling code ...
    return;
  }

  // Calculate reaction time with performance.now() and compensate for system latencies
  endTime = performance.now();
  const rawReactionTime = endTime - startTime - (startdelay - startTime);

  // Compensate for system latencies (16.67ms for 60Hz display + 8ms for mouse input)
  const systemLatency = 24.67; // 16.67 + 8
  const adjustedReactionTime = Math.max(
    0,
    Math.round(rawReactionTime - systemLatency)
  );

  // Display results
  container.classList.remove("success-bg");
  countdownDisplay.textContent = `${adjustedReactionTime}ms`;
  resultDisplay.textContent = "Click to try again";

  // Reset state
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
