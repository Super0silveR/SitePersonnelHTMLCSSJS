document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("startButton");
  const pauseButton = document.getElementById("pauseButton");

  const gridSize = 25;
  const tileCount = canvas.width / gridSize;
  const gameSpeed = 100;

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
  let lastMoveTime = 0;
  const moveBuffer = 50; // Minimum time (ms) between direction changes
  let gameSpeedControl = document.getElementById("gameSpeed");
  let speedValue = document.getElementById("speedValue");
  let currentGameSpeed = 100;
  let lastKeyPressTime = 0;
  const keyPressBuffer = 50; // Minimum time between key presses

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

    requestAnimationFrame(gameLoop);
  }

  function startGame() {
    if (!gameRunning) {
      gameRunning = true;
      gamePaused = false;
      score = 0;
      snake = [{ x: 0, y: 10 }];
      dx = 1;
      dy = 0;
      lastDirection = { dx: 1, dy: 0 };
      directionQueue = [];
      generateFood();
      updateButtonStates();
      requestAnimationFrame(gameLoop);
    }
  }

  function togglePause() {
    gamePaused = !gamePaused;
    updateButtonStates();
    if (!gamePaused) {
      lastFrameTime = performance.now();
      requestAnimationFrame(gameLoop);
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
    // Clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = "lime";
    snake.forEach((segment) => {
      ctx.fillRect(
        segment.x * gridSize,
        segment.y * gridSize,
        gridSize - 2,
        gridSize - 2
      );
    });

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(
      food.x * gridSize,
      food.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );

    // Draw game over message if game is not running
    if (!gameRunning) {
      ctx.fillStyle = "white";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    }
  }

  function moveSnake() {
    // Process next direction from queue if available
    if (directionQueue.length > 0) {
      const nextDirection = directionQueue[0];
      dx = nextDirection.dx;
      dy = nextDirection.dy;
      lastDirection = { ...nextDirection };
      directionQueue.shift();
    }

    // Calculate new head position with wrap-around
    const head = {
      x: (snake[0].x + dx + tileCount) % tileCount, // Wrap around horizontally
      y: (snake[0].y + dy + tileCount) % tileCount, // Wrap around vertically
    };

    // Check for self collision
    if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
      }
      gameRunning = false;
      updateScores();
      return;
    }

    snake.unshift(head);

    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
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
    currentGameSpeed = parseInt(this.value);
    speedValue.textContent = currentGameSpeed + "ms";
  });
});
