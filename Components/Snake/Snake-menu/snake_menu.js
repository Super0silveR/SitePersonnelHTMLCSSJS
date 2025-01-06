class SnakeMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Load HTML and CSS
    Promise.all([
      fetch("/components/snake/snake-menu/snake_menu.html").then((response) =>
        response.text()
      ),
      fetch("/components/snake/snake-menu/snake_menu.css").then((response) =>
        response.text()
      ),
    ]).then(([html, css]) => {
      this.shadowRoot.innerHTML = `<style>${css}</style>${html}`;
      this.initializeMenu();
    });
  }

  initializeMenu() {
    // Get menu elements
    this.settingsMenu = this.shadowRoot.querySelector("#settingsMenu");
    this.settingsButton = this.shadowRoot.querySelector("#settingsButton");
    this.effectMuteButton = this.shadowRoot.querySelector("#effectMuteButton");
    this.musicMuteButton = this.shadowRoot.querySelector("#musicMuteButton");
    this.volumeControl = this.shadowRoot.querySelector("#volumeControl");
    this.volumeValue = this.shadowRoot.querySelector("#volumeValue");
    this.gameSpeed = this.shadowRoot.querySelector("#gameSpeed");
    this.speedValue = this.shadowRoot.querySelector("#speedValue");

    // Initialize state
    this.isMuted = false;
    this.isBgMuted = false;
    this.volume = 50;
    this.isSettingsOpen = false;
    this.settingsMenu.style.display = "none"; // Start with menu closed

    // Add event listeners
    this.settingsButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggleSettings();
      // Dispatch pause event when settings are opened
      this.dispatchEvent(
        new CustomEvent("settingsToggle", {
          bubbles: true,
          composed: true,
        })
      );
    });

    this.effectMuteButton.addEventListener("click", () => this.toggleEffects());
    this.musicMuteButton.addEventListener("click", () =>
      this.toggleBackground()
    );
    this.volumeControl.addEventListener("input", () => this.updateVolume());
    this.gameSpeed.addEventListener("input", () => this.updateGameSpeed());
  }

  toggleSettings() {
    this.settingsMenu.style.display =
      this.settingsMenu.style.display === "block" ? "none" : "block";
  }

  handleClickOutside(event) {
    if (
      !this.settingsMenu.contains(event.target) &&
      event.target !== this.settingsButton
    ) {
      this.settingsMenu.style.display = "none";
    }
  }

  toggleEffects() {
    this.isMuted = !this.isMuted;
    this.effectMuteButton.innerHTML = this.isMuted
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
    this.dispatchEvent(
      new CustomEvent("toggleEffects", {
        detail: { isMuted: this.isMuted },
        bubbles: true,
        composed: true,
      })
    );
  }

  toggleBackground() {
    this.isBgMuted = !this.isBgMuted;
    this.musicMuteButton.innerHTML = this.isBgMuted
      ? '<i class="fas fa-music-slash"></i>'
      : '<i class="fas fa-music"></i>';
    this.dispatchEvent(
      new CustomEvent("toggleBackground", {
        detail: { isBgMuted: this.isBgMuted },
        bubbles: true,
        composed: true,
      })
    );
  }

  updateVolume() {
    const volume = this.volumeControl.value;
    this.volumeValue.textContent = volume + "%";
    this.volume = volume;

    this.dispatchEvent(
      new CustomEvent("volumeChange", {
        detail: { volume: parseFloat(volume) },
        bubbles: true,
        composed: true,
      })
    );
  }

  updateGameSpeed() {
    const speed = this.gameSpeed.value;
    this.speedValue.textContent = speed + "x";

    this.dispatchEvent(
      new CustomEvent("speedChange", {
        detail: { speed: parseFloat(speed) },
        bubbles: true,
        composed: true,
      })
    );
  }

  toggleGamePause() {
    if (this.snakeScreen) {
      this.snakeScreen.togglePause();
    }
  }
}

customElements.define("snake-menu", SnakeMenu);
