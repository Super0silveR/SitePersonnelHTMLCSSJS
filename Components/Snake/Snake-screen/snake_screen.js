class SnakeScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Initialize sound properties
    this.isMuted = false;
    this.isBgMuted = false;
    this.soundsLoaded = false;
    this.sounds = {};
  }

  connectedCallback() {
    const isRootPage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/");

    const basePath = isRootPage ? "." : "..";
    const componentPath = `${basePath}/Components/Snake/Snake-screen`;

    Promise.all([
      fetch(`${componentPath}/snake_screen.html`).then((response) =>
        response.text()
      ),
      fetch(`${componentPath}/snake_screen.css`).then((response) =>
        response.text()
      ),
    ])
      .then(([html, css]) => {
        this.shadowRoot.innerHTML = `<style>${css}</style>${html}`;
        // Load sounds after DOM is ready
        this.loadSounds();
        this.initializeGame();
      })
      .catch((error) => {
        console.error("Error loading HTML/CSS:", error);
      });
    document.addEventListener("keydown", this.handleKeyPress.bind(this));
  }

  loadSounds() {
    // Create and load all sound elements
    const soundFiles = {
      eat: "eat.mp3",
      gameOver: "gameOver.mp3",
      background: "gamebeat.mp3",
      step1: "step1.mp3",
      step2: "step2.mp3",
      step3: "step3.mp3",
      step4: "step4.mp3",
    };

    for (const [key, file] of Object.entries(soundFiles)) {
      const isRootPage =
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname.endsWith("/");
      const basePath = isRootPage ? "." : "..";
      const audio = new Audio(`${basePath}/Assets/Sounds/snake/${file}`);
      audio.preload = "auto";
      this.sounds[key] = audio;
    }

    // Set background music properties
    this.sounds.background.loop = true;
    this.sounds.background.volume = 0.5;

    // Set step sounds volume lower
    Object.keys(this.sounds)
      .filter((key) => key.startsWith("step"))
      .forEach((key) => {
        this.sounds[key].volume = 0.3;
      });

    this.soundsLoaded = true;
  }

  initializeGame() {
    // Store references as class properties
    this.canvas = this.shadowRoot.querySelector("#canvas");
    this.ctx = this.canvas.getContext("2d");
    this.startButton = this.shadowRoot.querySelector("#startButton");
    this.pauseButton = this.shadowRoot.querySelector("#pauseButton");

    // Ensure control buttons are available
    this.upButton = this.shadowRoot.querySelector("#upButton");
    this.downButton = this.shadowRoot.querySelector("#downButton");
    this.leftButton = this.shadowRoot.querySelector("#leftButton");
    this.rightButton = this.shadowRoot.querySelector("#rightButton");

    if (
      !this.upButton ||
      !this.downButton ||
      !this.leftButton ||
      !this.rightButton
    ) {
      console.error("Control buttons not found");
      return;
    }

    // Game constants
    this.gridSize = 25;
    this.tileCount = this.canvas.width / this.gridSize;
    this.keyPressBuffer = 50; // Minimum time between key presses

    // Game state
    this.snake = [{ x: 10, y: 10 }];
    this.food = { x: 15, y: 15 };
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.highScore = localStorage.getItem("snakeHighScore") || 0;
    this.gameRunning = false;
    this.gamePaused = false;
    this.lastDirection = { dx: 0, dy: 0 };
    this.directionQueue = [];
    this.lastFrameTime = 0;
    this.currentGameSpeed = 16.6667 * 5;
    this.lastKeyPressTime = 0;

    // Bind event handlers
    this.upButton.addEventListener("touchstart", () =>
      this.handleMobileControl("up")
    );
    this.upButton.addEventListener("click", () =>
      this.handleMobileControl("up")
    );
    this.downButton.addEventListener("touchstart", () =>
      this.handleMobileControl("down")
    );
    this.downButton.addEventListener("click", () =>
      this.handleMobileControl("down")
    );
    this.leftButton.addEventListener("touchstart", () =>
      this.handleMobileControl("left")
    );
    this.leftButton.addEventListener("click", () =>
      this.handleMobileControl("left")
    );
    this.rightButton.addEventListener("touchstart", () =>
      this.handleMobileControl("right")
    );
    this.rightButton.addEventListener("click", () =>
      this.handleMobileControl("right")
    );

    this.startButton.addEventListener("click", () => this.startGame());
    this.pauseButton.addEventListener("click", () => this.togglePause());

    // Bind game loop
    this.gameLoop = this.gameLoop.bind(this);
  }

  handleMobileControl(direction) {
    if (!this.gameRunning || this.gamePaused) return;

    const currentTime = performance.now();
    if (currentTime - this.lastKeyPressTime < this.keyPressBuffer) return;

    let newDirection = null;

    switch (direction) {
      case "up":
        if (this.lastDirection.dy !== 1 && this.directionQueue.length === 0) {
          newDirection = { dx: 0, dy: -1 };
        }
        break;
      case "down":
        if (this.lastDirection.dy !== -1 && this.directionQueue.length === 0) {
          newDirection = { dx: 0, dy: 1 };
        }
        break;
      case "left":
        if (this.lastDirection.dx !== 1 && this.directionQueue.length === 0) {
          newDirection = { dx: -1, dy: 0 };
        }
        break;
      case "right":
        if (this.lastDirection.dx !== -1 && this.directionQueue.length === 0) {
          newDirection = { dx: 1, dy: 0 };
        }
        break;
    }

    if (newDirection) {
      this.directionQueue = [newDirection];
      this.lastKeyPressTime = currentTime;
    }
  }

  updateButtonStates() {
    this.startButton.style.opacity = this.gameRunning ? "0.5" : "1";
    this.startButton.style.cursor = this.gameRunning
      ? "not-allowed"
      : "pointer";
    this.pauseButton.innerHTML = this.gamePaused ? "Resume" : "Pause";
    this.pauseButton.style.display = this.gameRunning ? "inline-block" : "none";
  }

  gameLoop(currentTime) {
    if (!this.gameRunning || this.gamePaused) return;

    const deltaTime = currentTime - this.lastFrameTime;
    if (deltaTime >= this.currentGameSpeed) {
      this.moveSnake();
      this.drawGame();
      this.lastFrameTime = currentTime;
    }

    if (this.gameRunning && !this.isBgMuted && this.soundsLoaded) {
      if (this.sounds.background.paused) {
        this.sounds.background.play().catch((error) => {
          console.log("Error playing background sound:", error);
        });
      }
    }

    requestAnimationFrame(this.gameLoop);
  }

  startGame() {
    if (!this.gameRunning) {
      this.gameRunning = true;
      this.gamePaused = false;
      this.score = 0;
      this.snake = [{ x: 10, y: 10 }];
      this.dx = 0;
      this.dy = 0;
      this.lastDirection = { dx: 0, dy: 0 };
      this.directionQueue = [];
      this.generateFood();
      this.updateButtonStates();
    }

    if (!this.isBgMuted && this.soundsLoaded) {
      this.sounds.background.play().catch((error) => {
        console.log("Error playing background sound:", error);
      });
    }

    requestAnimationFrame(this.gameLoop);
  }

  togglePause() {
    this.gamePaused = !this.gamePaused;
    this.updateButtonStates();

    if (!this.gamePaused) {
      this.lastFrameTime = performance.now();
      if (!this.isBgMuted && this.soundsLoaded) {
        this.sounds.background.play().catch((error) => {
          console.log("Error playing background sound:", error);
        });
      }
      requestAnimationFrame(this.gameLoop);
    } else if (this.soundsLoaded) {
      this.sounds.background.pause();
    }
  }

  generateFood() {
    let validPosition = false;
    while (!validPosition) {
      this.food.x = Math.floor(Math.random() * this.tileCount);
      this.food.y = Math.floor(Math.random() * this.tileCount);
      validPosition = !this.snake.some(
        (segment) => segment.x === this.food.x && segment.y === this.food.y
      );
    }
  }

  drawGame() {
    this.drawChessBoard();
    this.drawSnake();
    this.drawFood();
    if (!this.gameRunning) {
      this.drawGameOver();
    }
  }

  drawChessBoard() {
    for (let i = 0; i < this.tileCount; i++) {
      for (let j = 0; j < this.tileCount; j++) {
        this.ctx.fillStyle = (i + j) % 2 === 0 ? "#141712" : "#33271f"; // Lighter tan and darker brown
        this.ctx.fillRect(
          i * this.gridSize,
          j * this.gridSize,
          this.gridSize,
          this.gridSize
        );
      }
    }
  }

  drawSnake() {
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        this.drawSnakeHead(segment);
      } else {
        this.drawSnakeBody(segment, index);
      }
    });
  }

  drawSnakeBody(segment, index) {
    this.ctx.fillStyle = "#80FF00";
    this.ctx.save();
    this.ctx.translate(
      segment.x * this.gridSize + this.gridSize / 2,
      segment.y * this.gridSize + this.gridSize / 2
    );

    const prev = this.snake[index - 1];
    const next = this.snake[index + 1];

    if (next) {
      // Calculate differences considering wrap-around
      const dx1 =
        (((prev.x - segment.x + this.tileCount) % this.tileCount) +
          this.tileCount) %
        this.tileCount;
      const dy1 =
        (((prev.y - segment.y + this.tileCount) % this.tileCount) +
          this.tileCount) %
        this.tileCount;
      const dx2 =
        (((next.x - segment.x + this.tileCount) % this.tileCount) +
          this.tileCount) %
        this.tileCount;
      const dy2 =
        (((next.y - segment.y + this.tileCount) % this.tileCount) +
          this.tileCount) %
        this.tileCount;

      // Convert wrap-around differences to -1, 0, or 1
      const normalizedDx1 =
        dx1 > this.tileCount / 2 ? dx1 - this.tileCount : dx1;
      const normalizedDy1 =
        dy1 > this.tileCount / 2 ? dy1 - this.tileCount : dy1;
      const normalizedDx2 =
        dx2 > this.tileCount / 2 ? dx2 - this.tileCount : dx2;
      const normalizedDy2 =
        dy2 > this.tileCount / 2 ? dy2 - this.tileCount : dy2;

      if (
        normalizedDx1 === -normalizedDx2 &&
        normalizedDy1 === -normalizedDy2
      ) {
        // Straight segment
        if (normalizedDx1 !== 0) {
          // Horizontal
          this.ctx.fillRect(
            -this.gridSize / 2,
            -this.gridSize / 4,
            this.gridSize,
            this.gridSize / 2
          );
        } else {
          // Vertical
          this.ctx.fillRect(
            -this.gridSize / 4,
            -this.gridSize / 2,
            this.gridSize / 2,
            this.gridSize
          );
        }
      } else {
        // Corner segment
        let rotation = 0;

        // Determine rotation based on normalized differences
        if (
          (normalizedDx1 === 0 &&
            normalizedDx2 === 1 &&
            normalizedDy1 === -1 &&
            normalizedDy2 === 0) ||
          (normalizedDx1 === 1 &&
            normalizedDx2 === 0 &&
            normalizedDy1 === 0 &&
            normalizedDy2 === -1)
        ) {
          rotation = 0;
        } else if (
          (normalizedDx1 === -1 &&
            normalizedDx2 === 0 &&
            normalizedDy1 === 0 &&
            normalizedDy2 === -1) ||
          (normalizedDx1 === 0 &&
            normalizedDx2 === -1 &&
            normalizedDy1 === -1 &&
            normalizedDy2 === 0)
        ) {
          rotation = -Math.PI / 2;
        } else if (
          (normalizedDx1 === 1 &&
            normalizedDx2 === 0 &&
            normalizedDy1 === 0 &&
            normalizedDy2 === 1) ||
          (normalizedDx1 === 0 &&
            normalizedDx2 === 1 &&
            normalizedDy1 === 1 &&
            normalizedDy2 === 0)
        ) {
          rotation = Math.PI / 2;
        } else if (
          (normalizedDx1 === 0 &&
            normalizedDx2 === -1 &&
            normalizedDy1 === 1 &&
            normalizedDy2 === 0) ||
          (normalizedDx1 === -1 &&
            normalizedDx2 === 0 &&
            normalizedDy1 === 0 &&
            normalizedDy2 === 1)
        ) {
          rotation = Math.PI;
        }

        this.ctx.rotate(rotation);
        // Draw a rounded corner
        this.ctx.beginPath();
        this.ctx.moveTo(-this.gridSize / 4, -this.gridSize / 2);
        this.ctx.quadraticCurveTo(
          -this.gridSize / 4,
          this.gridSize / 4,
          this.gridSize / 2,
          this.gridSize / 4
        );
        this.ctx.lineTo(this.gridSize / 2, -this.gridSize / 4);
        this.ctx.quadraticCurveTo(
          this.gridSize / 4,
          -this.gridSize / 4,
          this.gridSize / 4,
          -this.gridSize / 2
        );
        this.ctx.lineTo(-this.gridSize / 4, -this.gridSize / 2);
        this.ctx.fill();
      }
    } else {
      // Draw tail segment considering wrap-around
      const dx =
        (((segment.x - prev.x + this.tileCount) % this.tileCount) +
          this.tileCount) %
        this.tileCount;
      const dy =
        (((segment.y - prev.y + this.tileCount) % this.tileCount) +
          this.tileCount) %
        this.tileCount;

      // Convert to normalized differences
      const normalizedDx = dx > this.tileCount / 2 ? dx - this.tileCount : dx;
      const normalizedDy = dy > this.tileCount / 2 ? dy - this.tileCount : dy;

      const rotation = Math.atan2(normalizedDy, normalizedDx) + Math.PI;

      this.ctx.rotate(rotation);

      // Tail shape
      this.ctx.beginPath();
      this.ctx.moveTo(-this.gridSize / 3, 0);
      this.ctx.lineTo(this.gridSize / 4, -this.gridSize / 4);
      this.ctx.lineTo(this.gridSize / 4, this.gridSize / 4);
      this.ctx.closePath();
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawSnakeHead(segment) {
    this.ctx.fillStyle = "#80FF00";
    this.ctx.save();
    this.ctx.translate(
      segment.x * this.gridSize + this.gridSize / 2,
      segment.y * this.gridSize + this.gridSize / 2
    );

    // Determine head rotation
    let rotation = 0;
    if (this.dx === 1) rotation = 0;
    else if (this.dx === -1) rotation = Math.PI;
    else if (this.dy === -1) rotation = -Math.PI / 2;
    else if (this.dy === 1) rotation = Math.PI / 2;

    this.ctx.rotate(rotation);

    // Draw the head (oval with eyes)
    this.ctx.fillStyle = "#80FF00";
    this.ctx.beginPath();
    this.ctx.ellipse(
      0,
      0,
      this.gridSize / 2,
      this.gridSize / 3,
      0,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Eyes
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(-this.gridSize / 4, -this.gridSize / 6, 3, 0, Math.PI * 2); // Left eye
    this.ctx.arc(-this.gridSize / 4, this.gridSize / 6, 3, 0, Math.PI * 2); // Right eye
    this.ctx.fill();

    this.ctx.fillStyle = "black";
    this.ctx.beginPath();
    this.ctx.arc(-this.gridSize / 4, -this.gridSize / 6, 1.5, 0, Math.PI * 2); // Left pupil
    this.ctx.arc(-this.gridSize / 4, this.gridSize / 6, 1.5, 0, Math.PI * 2); // Right pupil
    this.ctx.fill();
    this.ctx.restore();
  }

  drawFood() {
    const time = performance.now() / 1000;
    const pulseScale = 1 + Math.sin(time * 4) * 0.1;

    this.ctx.fillStyle = "#FF0000"; // Bright red
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      (this.gridSize / 2 - 2) * pulseScale,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Apple stem with higher contrast
    this.ctx.fillStyle = "#2B1810"; // Darker brown
    this.ctx.fillRect(
      this.food.x * this.gridSize + this.gridSize / 2 - 2,
      this.food.y * this.gridSize + 2,
      4,
      8
    );
  }

  drawGameOver() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "48px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "GAME OVER",
      this.canvas.width / 2,
      this.canvas.height / 2 - 30
    );
    this.ctx.font = "24px Arial";
    this.ctx.fillText(
      "Score: " + this.score,
      this.canvas.width / 2,
      this.canvas.height / 2 + 10
    );
    this.ctx.fillText(
      "Press (P) to restart",
      this.canvas.width / 2,
      this.canvas.height / 2 + 40
    );
  }

  moveSnake() {
    // Process next direction from queue if available
    if (this.directionQueue.length > 0) {
      const nextDirection = this.directionQueue[0];
      this.dx = nextDirection.dx;
      this.dy = nextDirection.dy;

      // Play direction change sound based on new direction
      if (this.soundsLoaded) {
        if (this.dx === 0 && this.dy === -1) this.playSound("step1");
        else if (this.dx === 1 && this.dy === 0) this.playSound("step2");
        else if (this.dx === 0 && this.dy === 1) this.playSound("step3");
        else if (this.dx === -1 && this.dy === 0) this.playSound("step4");
      }

      this.lastDirection = { ...nextDirection };
      this.directionQueue.shift();
    }

    // Calculate new head position with wrap-around
    const head = {
      x: (this.snake[0].x + this.dx + this.tileCount) % this.tileCount,
      y: (this.snake[0].y + this.dy + this.tileCount) % this.tileCount,
    };

    // Check for self collision
    if (
      this.snake.some(
        (segment) => segment.x === head.x && segment.y === head.y
      ) &&
      this.score !== 0
    ) {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem("snakeHighScore", this.highScore);
      }
      this.gameRunning = false;
      if (this.soundsLoaded) {
        this.sounds.background.pause();
        this.playSound("gameOver");
      }
      this.updateScores();
      return;
    }

    this.snake.unshift(head);

    // Check for food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      if (this.soundsLoaded) {
        this.playSound("eat");
      }
      this.score += 10;
      this.updateScores();
      this.generateFood();
    } else {
      this.snake.pop();
    }
  }

  updateScores() {
    this.shadowRoot.getElementById("currentScore").textContent = this.score;
    this.shadowRoot.getElementById("highScoreDisplay").textContent =
      this.highScore;
  }

  playSound(soundKey) {
    if (!this.isMuted && this.soundsLoaded && this.sounds[soundKey]) {
      const sound = this.sounds[soundKey];
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.log(`Error playing ${soundKey} sound:`, error);
      });
    }
  }

  handleKeyPress(event) {
    // Prevent default behavior for arrow keys and 'p' key
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "p"].includes(
        event.key
      )
    ) {
      event.preventDefault();
    }

    if (event.key === "p") {
      this.togglePause();
      return;
    }

    if (!this.gameRunning || this.gamePaused) return;

    const currentTime = performance.now();
    if (currentTime - this.lastKeyPressTime < this.keyPressBuffer) return;

    let newDirection = null;

    switch (event.key) {
      case "ArrowUp":
        if (this.lastDirection.dy !== 1 && this.directionQueue.length === 0) {
          newDirection = { dx: 0, dy: -1 };
        }
        break;
      case "ArrowDown":
        if (this.lastDirection.dy !== -1 && this.directionQueue.length === 0) {
          newDirection = { dx: 0, dy: 1 };
        }
        break;
      case "ArrowLeft":
        if (this.lastDirection.dx !== 1 && this.directionQueue.length === 0) {
          newDirection = { dx: -1, dy: 0 };
        }
        break;
      case "ArrowRight":
        if (this.lastDirection.dx !== -1 && this.directionQueue.length === 0) {
          newDirection = { dx: 1, dy: 0 };
        }
        break;
    }

    if (newDirection) {
      this.directionQueue = [newDirection]; // Replace queue instead of pushing
      this.lastKeyPressTime = currentTime;
    }
  }

  updateSoundSettings() {
    if (this.soundsLoaded) {
      Object.values(this.sounds).forEach((sound) => {
        if (sound !== this.sounds.background) {
          sound.volume = this.isMuted ? 0 : this.volume;
        }
      });

      if (this.sounds.background) {
        this.sounds.background.volume = this.isBgMuted ? 0 : this.volume;
        if (!this.isBgMuted && this.gameRunning && !this.gamePaused) {
          this.sounds.background.play();
        } else {
          this.sounds.background.pause();
        }
      }
    }
  }

  updateGameSpeed() {
    // Adjust the game loop speed based on currentGameSpeed
    if (this.gameRunning) {
      clearInterval(this.gameInterval);
      this.gameInterval = setInterval(
        () => this.gameLoop(),
        this.currentGameSpeed
      );
    }
  }
}

customElements.define("snake-screen", SnakeScreen);
