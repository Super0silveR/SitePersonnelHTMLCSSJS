document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("startButton");
  const pauseButton = document.getElementById("pauseButton");

  const gridSize = 25;
  const tileCount = canvas.width / gridSize;

  let snake = [{ x: 10, y: 10 }];
  let food = { x: 15, y: 15 };
  let dx = 0;
  let dy = 0;
  let score = 0;
  let highScore = localStorage.getItem("snakeHighScore") || 0;
  let gameRunning = false;
  let gamePaused = false;
  let lastDirection = { dx: 0, dy: 0 };
  let directionQueue = [];
  let lastFrameTime = 0;
  let gameSpeedControl = document.getElementById("gameSpeed");
  let speedValue = document.getElementById("speedValue");
  let currentGameSpeed = 16.6667 * 5;
  let lastKeyPressTime = 0;
  const keyPressBuffer = 50; // Minimum time between key presses

  let isMuted = false;
  const eatSound = document.getElementById("eatSound");
  const gameOverSound = document.getElementById("gameOverSound");
  const backgroundSound = document.getElementById("backgroundSound");
  const stepSounds = {
    up: document.getElementById("step1Sound"),
    right: document.getElementById("step2Sound"),
    down: document.getElementById("step3Sound"),
    left: document.getElementById("step4Sound"),
  };

  let isBgMuted = false;
  const bgMuteButton = document.getElementById("bgMuteButton");
  const volumeControl = document.getElementById("volumeControl");
  const volumeValue = document.getElementById("volumeValue");

  function updateButtonStates() {
    startButton.style.opacity = gameRunning ? "0.5" : "1";
    startButton.style.cursor = gameRunning ? "not-allowed" : "pointer";

    pauseButton.innerHTML = gamePaused ? "Resume" : "Pause";
    pauseButton.style.display = gameRunning ? "inline-block" : "none";
  }

  function gameLoop(currentTime) {
    if (!gameRunning || gamePaused) return;

    const deltaTime = currentTime - lastFrameTime;
    if (deltaTime >= currentGameSpeed) {
      moveSnake();
      drawGame();
      lastFrameTime = currentTime;
    }

    // Play background music if game is running and not muted
    if (gameRunning && !isBgMuted && backgroundSound.paused) {
      backgroundSound.play().catch((error) => {
        console.log("Error playing background sound:", error);
      });
    }

    requestAnimationFrame(gameLoop);
  }

  function startGame() {
    if (!gameRunning) {
      gameRunning = true;
      gamePaused = false;
      score = 0;
      snake = [{ x: 10, y: 10 }];
      dx = 0;
      dy = 0;
      lastDirection = { dx: 0, dy: 0 };
      directionQueue = [];
      generateFood();
      updateButtonStates();

      // Start background music if not muted
      if (!isBgMuted) {
        backgroundSound.play().catch((error) => {
          console.log("Error playing background sound:", error);
        });
      }

      requestAnimationFrame(gameLoop);
    }
  }

  function togglePause() {
    gamePaused = !gamePaused;
    updateButtonStates();
    if (!gamePaused) {
      lastFrameTime = performance.now();
      if (!isBgMuted) {
        backgroundSound.play().catch((error) => {
          console.log("Error playing background sound:", error);
        });
      }
      requestAnimationFrame(gameLoop);
    } else {
      backgroundSound.pause();
    }
  }

  function generateFood() {
    let validPosition = false;
    while (!validPosition) {
      food.x = Math.floor(Math.random() * tileCount);
      food.y = Math.floor(Math.random() * tileCount);
      validPosition = !snake.some(
        (segment) => segment.x === food.x && segment.y === food.y
      );
    }
  }

  function drawGame() {
    // Draw chess board background with smoother colors
    for (let i = 0; i < tileCount; i++) {
      for (let j = 0; j < tileCount; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? "#141712" : "#33271f"; // Lighter tan and darker brown
        ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
      }
    }

    // Calculate distance to food for head glow effect
    const head = snake[0];
    const distanceToFood = Math.sqrt(
      Math.pow(head.x - food.x, 2) + Math.pow(head.y - food.y, 2)
    );
    const glowIntensity = Math.max(0, 1 - distanceToFood / 10);

    // Draw snake with size gradient
    snake.forEach((segment, index) => {
      const sizeReduction = (index / snake.length) * 4;
      const segmentSize = gridSize - 2 - sizeReduction;

      ctx.fillStyle = "#80FF00"; // Darker, more saturated green

      if (index === 0) {
        // Draw head with direction and glow effect
        ctx.save();
        ctx.translate(
          segment.x * gridSize + gridSize / 2,
          segment.y * gridSize + gridSize / 2
        );

        // Determine rotation based on direction
        let rotation = 0;
        if (dx === 1) rotation = 0;
        else if (dx === -1) rotation = Math.PI;
        else if (dy === -1) rotation = -Math.PI / 2;
        else if (dy === 1) rotation = Math.PI / 2;

        ctx.rotate(rotation);

        // Draw snake head
        ctx.fillStyle = "#80FF00"; // Slightly darker for head
        ctx.beginPath();
        ctx.ellipse(0, 0, gridSize / 2, gridSize / 3, 0, 0, Math.PI * 2); // Base head shape
        ctx.fill();

        // Eyes
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(-gridSize / 4, -gridSize / 6, 3, 0, Math.PI * 2);
        ctx.arc(-gridSize / 4, gridSize / 6, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(-gridSize / 4, -gridSize / 6, 1.5, 0, Math.PI * 2);
        ctx.arc(-gridSize / 4, gridSize / 6, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = "yellow";
        ctx.shadowBlur = glowIntensity * 15;
        ctx.restore();
      } else {
        // Draw body segments with corner smoothing
        const prev = snake[index - 1];
        const next = snake[index + 1];

        // Draw all body segments, not just ones with prev and next
        ctx.beginPath();
        ctx.arc(
          segment.x * gridSize + gridSize / 2,
          segment.y * gridSize + gridSize / 2,
          segmentSize / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    });

    // Draw animated apple with higher contrast
    const time = performance.now() / 1000;
    const pulseScale = 1 + Math.sin(time * 4) * 0.1;

    ctx.fillStyle = "#FF0000"; // Bright red
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      (gridSize / 2 - 2) * pulseScale,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Apple stem with higher contrast
    ctx.fillStyle = "#2B1810"; // Darker brown
    ctx.fillRect(
      food.x * gridSize + gridSize / 2 - 2,
      food.y * gridSize + 2,
      4,
      8
    );

    // Draw game over message if game is not running
    if (!gameRunning) {
      ctx.fillStyle = "white";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = "24px Arial";
      ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 10);
      ctx.fillText(
        "Press (P) to restart",
        canvas.width / 2,
        canvas.height / 2 + 40
      );
    }
  }

  function moveSnake() {
    // Process next direction from queue if available
    if (directionQueue.length > 0) {
      const nextDirection = directionQueue[0];
      dx = nextDirection.dx;
      dy = nextDirection.dy;

      // Play direction change sound based on new direction
      if (dx === 0 && dy === -1) playSound(stepSounds.up);
      else if (dx === 1 && dy === 0) playSound(stepSounds.right);
      else if (dx === 0 && dy === 1) playSound(stepSounds.down);
      else if (dx === -1 && dy === 0) playSound(stepSounds.left);

      lastDirection = { ...nextDirection };
      directionQueue.shift();
    }

    // Calculate new head position with wrap-around
    const head = {
      x: (snake[0].x + dx + tileCount) % tileCount, // Wrap around horizontally
      y: (snake[0].y + dy + tileCount) % tileCount, // Wrap around vertically
    };

    // Check for self collision
    if (
      snake.some((segment) => segment.x === head.x && segment.y === head.y) &&
      score != 0
    ) {
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
      }
      gameRunning = false;
      backgroundSound.pause();
      playSound(gameOverSound);
      updateScores();
      return;
    }

    snake.unshift(head);

    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
      playSound(eatSound);
      score += 10;
      updateScores();
      generateFood();
    } else {
      snake.pop();
    }
  }

  // Update score display
  function updateScores() {
    document.getElementById("currentScore").textContent = score;
    document.getElementById("highScoreDisplay").textContent = highScore;
  }

  // Style buttons with custom colors from the palette
  startButton.classList.add("btn");
  startButton.style.backgroundColor = "var(--primary-color)";
  startButton.style.color = "var(--light-color)";
  startButton.style.marginRight = "10px";

  pauseButton.classList.add("btn");
  pauseButton.style.backgroundColor = "var(--secondary-color)";
  pauseButton.style.color = "var(--light-color)";

  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", togglePause);
  updateButtonStates();

  // Add keyboard controls with buffer
  document.addEventListener("keydown", function (event) {
    if (event.key === "p") {
      togglePause();
      return;
    }

    if (!gameRunning || gamePaused) return;

    const currentTime = performance.now();
    if (currentTime - lastKeyPressTime < keyPressBuffer) return;

    let newDirection = null;

    switch (event.key) {
      case "ArrowUp":
        if (lastDirection.dy !== 1 && directionQueue.length === 0) {
          newDirection = { dx: 0, dy: -1 };
        }
        break;
      case "ArrowDown":
        if (lastDirection.dy !== -1 && directionQueue.length === 0) {
          newDirection = { dx: 0, dy: 1 };
        }
        break;
      case "ArrowLeft":
        if (lastDirection.dx !== 1 && directionQueue.length === 0) {
          newDirection = { dx: -1, dy: 0 };
        }
        break;
      case "ArrowRight":
        if (lastDirection.dx !== -1 && directionQueue.length === 0) {
          newDirection = { dx: 1, dy: 0 };
        }
        break;
    }

    if (newDirection) {
      directionQueue = [newDirection]; // Replace queue instead of pushing
      lastKeyPressTime = currentTime;
    }
  });

  // Add this event listener for speed control
  gameSpeedControl.addEventListener("input", function () {
    currentGameSpeed = parseInt(this.value) * 16.6667;
    speedValue.textContent = currentGameSpeed / 16.6667 + "x";
  });

  muteButton.addEventListener("click", toggleMute);

  function playSound(sound) {
    if (!isMuted && sound && sound !== backgroundSound) {
      sound.currentTime = 0;
      sound.volume = volumeControl.value / 100;
      sound.play().catch((error) => {
        console.log("Error playing sound:", error);
      });
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    muteButton.innerHTML = isMuted
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
  }

  bgMuteButton.addEventListener("click", toggleBgMute);
  volumeControl.addEventListener("input", updateVolume);

  function toggleBgMute() {
    isBgMuted = !isBgMuted;
    bgMuteButton.innerHTML = isBgMuted
      ? '<i class="fas fa-music-slash"></i>'
      : '<i class="fas fa-music"></i>';
    if (isBgMuted) {
      backgroundSound.pause();
    } else if (gameRunning && !gamePaused) {
      backgroundSound.volume = volumeControl.value / 100;
      backgroundSound.play().catch((error) => {
        console.log("Error playing background sound:", error);
      });
    }
  }

  function updateVolume() {
    const volume = volumeControl.value / 100;
    // Update volume for all sounds
    backgroundSound.volume = volume;
    eatSound.volume = volume;
    gameOverSound.volume = volume;
    Object.values(stepSounds).forEach((sound) => {
      sound.volume = volume;
    });
    volumeValue.textContent = volumeControl.value + "%";
  }
});
