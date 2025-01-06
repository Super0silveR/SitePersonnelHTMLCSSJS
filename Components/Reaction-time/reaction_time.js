class ReactionTime extends HTMLElement {
  constructor() {
    super();
    this.container = null;
    this.countdownDisplay = null;
    this.resultDisplay = null;
    this.startTime = null;
    this.isWaiting = false;
    this.isTestActive = false;
  }

  connectedCallback() {
    fetch("/components/reaction-time/reaction_time.html")
      .then((response) => response.text())
      .then((html) => {
        this.innerHTML = html;
        this.initializeReactionTest();
      });
  }

  initializeReactionTest() {
    this.container = this.querySelector("#reaction-container");
    this.countdownDisplay = this.querySelector("#countdown-display");
    this.resultDisplay = this.querySelector("#result-display");

    if (this.container) {
      this.container.removeEventListener("click", this.handleClick.bind(this));
      this.container.addEventListener("click", this.handleClick.bind(this));
    }
  }

  startReactionTest() {
    this.countdownDisplay.textContent = "Wait for green...";
    this.resultDisplay.textContent = "";

    const delay = 500 + Math.random() * 2500;
    const startWait = performance.now();
    const waitUntil = startWait + delay;

    const checkTime = () => {
      if (performance.now() >= waitUntil) {
        this.isWaiting = false;
        this.isTestActive = true;
        this.container.classList.remove("waiting-bg");
        this.container.classList.add("success-bg");
        this.countdownDisplay.textContent = "Click!";
        this.startTime = performance.now();
      } else {
        requestAnimationFrame(checkTime);
      }
    };

    requestAnimationFrame(checkTime);
  }

  endTest() {
    if (!this.isTestActive) return;

    const endTime = performance.now();
    const rawReactionTime = endTime - this.startTime;
    const systemLatency = 95;
    const adjustedReactionTime = Math.max(
      0,
      Math.round(rawReactionTime - systemLatency)
    );

    requestAnimationFrame(() => {
      this.container.classList.remove("success-bg");
      this.countdownDisplay.textContent = `${adjustedReactionTime}ms`;
      this.resultDisplay.textContent = "Click to try again";
    });

    this.isTestActive = false;
  }

  handleClick() {
    if (this.isTestActive) {
      this.endTest();
    } else if (!this.isWaiting) {
      this.isWaiting = true;
      this.container.classList.add("waiting-bg");
      this.startReactionTest();
    }
  }
}

customElements.define("reaction-time", ReactionTime);
