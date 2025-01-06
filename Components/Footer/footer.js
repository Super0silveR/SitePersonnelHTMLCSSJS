class Footer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    fetch("/components/footer/footer.html")
      .then((response) => response.text())
      .then((html) => {
        this.innerHTML = html;
      });
  }
}

customElements.define("footer-component", Footer);
