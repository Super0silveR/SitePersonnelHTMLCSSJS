class SnakeGame extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    Promise.all([
      fetch("/components/snake/snake_game.html").then((response) =>
        response.text()
      ),
      fetch("/components/snake/snake_game.css").then((response) =>
        response.text()
      ),
    ])
      .then(([html, css]) => {
        this.shadowRoot.innerHTML = `<style>${css}</style>${html}`;
        this.initializeGame();
      })
      .catch((error) => {
        console.error("Error loading HTML/CSS:", error);
      });
  }

  initializeGame() {
    const snakeScreen = this.shadowRoot.querySelector("snake-screen");
    const snakeMenu = this.shadowRoot.querySelector("snake-menu");

    snakeMenu.addEventListener("settingsToggle", () => {
      if (snakeScreen.gameRunning) {
        snakeScreen.togglePause();
      }
    });

    snakeMenu.addEventListener("toggleEffects", (event) => {
      snakeScreen.isMuted = event.detail.isMuted;
      snakeScreen.updateSoundSettings();
    });

    snakeMenu.addEventListener("toggleBackground", (event) => {
      snakeScreen.isBgMuted = event.detail.isBgMuted;
      snakeScreen.updateSoundSettings();
    });

    snakeMenu.addEventListener("volumeChange", (event) => {
      snakeScreen.volume = event.detail.volume / 100;
      snakeScreen.updateSoundSettings();
    });

    snakeMenu.addEventListener("speedChange", (event) => {
      snakeScreen.currentGameSpeed = 16.6667 * (10 - event.detail.speed + 1);
      snakeScreen.updateGameSpeed();
    });
  }
}

customElements.define("snake-game", SnakeGame);
