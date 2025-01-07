class Navbar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const isRootPage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/");
    const navbarPath = isRootPage
      ? "./Components/Navbar/navbar.html"
      : "../Components/Navbar/navbar.html";

    fetch(navbarPath)
      .then((response) => response.text())
      .then((html) => {
        this.innerHTML = html;
        this.initializeNavbar();
        this.handleHomePageItems();
      })
      .catch((error) => {
        console.error("Error loading navbar:", error);
      });
  }

  initializeNavbar() {
    // Add your existing navbar JavaScript functionality
    window.burgerMenu = () => {
      const menu = document.getElementById("optionmenu");
      menu.style.display = menu.style.display === "grid" ? "none" : "grid";
    };

    window.closeOptionMenu = () => {
      document.getElementById("optionmenu").style.display = "none";
    };
  }

  handleHomePageItems() {
    // Check if we're on the home page
    const isHomePage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/");

    // Get all elements with home-only class
    const homeOnlyElements = this.querySelectorAll(".home-only");

    // Show/hide based on current page
    homeOnlyElements.forEach((element) => {
      element.style.display = isHomePage ? "block" : "none";
    });
  }
}

customElements.define("nav-bar", Navbar);
