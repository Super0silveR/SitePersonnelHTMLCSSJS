class Footer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const isRootPage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/");
    const footerPath = isRootPage
      ? "./Components/Footer/footer.html"
      : "../Components/Footer/footer.html";

    fetch(footerPath)
      .then((response) => response.text())
      .then((html) => {
        this.innerHTML = html;
      })
      .catch((error) => {
        console.error("Error loading footer:", error);
      });
  }
}

customElements.define("footer-component", Footer);
