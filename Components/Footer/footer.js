class Footer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    fetch("./Components/Footer/footer.html")
      .then((response) => response.text())
      .then((html) => {
        this.innerHTML = html;
      });
  }
}

customElements.define("footer-component", Footer);
