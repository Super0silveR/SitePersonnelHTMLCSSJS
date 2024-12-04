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
  let gameRunning = false;
  let gamePaused = false;

  // Game controls
  document.addEventListener("keydown", function (event) {
    switch (event.key) {
      case "ArrowUp":
        if (dy !== 1) {
          dx = 0;
          dy = -1;
        }
        break;
      case "ArrowDown":
        if (dy !== -1) {
          dx = 0;
          dy = 1;
        }
        break;
      case "ArrowLeft":
        if (dx !== 1) {
          dx = -1;
          dy = 0;
        }
        break;
      case "ArrowRight":
        if (dx !== -1) {
          dx = 1;
          dy = 0;
        }
        break;
    }
  });

  startButton.addEventListener("click", function () {
    if (!gameRunning) {
      gameRunning = true;
      gamePaused = false;
      score = 0;
      snake = [{ x: 10, y: 10 }];
      dx = 1;
      dy = 0;
      generateFood();
      gameLoop();
    }
  });

  pauseButton.addEventListener("click", function () {
    gamePaused = !gamePaused;
    if (!gamePaused) gameLoop();
  });

  function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
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

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
  }

  function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check for wall collision
    if (
      head.x < 0 ||
      head.x >= tileCount ||
      head.y < 0 ||
      head.y >= tileCount
    ) {
      gameRunning = false;
      return;
    }

    // Check for self collision
    if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      gameRunning = false;
      return;
    }

    snake.unshift(head);

    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      generateFood();
    } else {
      snake.pop();
    }
  }

  function gameLoop() {
    if (!gameRunning || gamePaused) return;

    moveSnake();
    drawGame();

    setTimeout(gameLoop, 100);
  }
});
