import SavePlanController from "./save_plan.controller.js";

class SavePlan extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.controller = new SavePlanController(this);
  }

  connectedCallback() {
    const isRootPage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname.endsWith("/");

    const basePath = isRootPage ? "." : "..";
    const componentPath = `${basePath}/Components/Save-plan`;

    Promise.all([
      fetch(`${componentPath}/save_plan.html`).then((response) =>
        response.text()
      ),
      fetch(`${componentPath}/save_plan.css`).then((response) =>
        response.text()
      ),
    ]).then(([html, css]) => {
      this.shadowRoot.innerHTML = `<style>${css}</style>${html}`;
      this.initializeSavePlan();
    });
  }

  initializeSavePlan() {
    const ctx = this.shadowRoot.querySelector("#savingsChart").getContext("2d");
    this.controller.initialize(ctx);
    this.setupTabsListeners();
  }

  setupTabsListeners() {
    const newPlanButton = this.shadowRoot.querySelector("#newPlanButton");
    const newPlanDialog = this.shadowRoot.querySelector("#newPlanDialog");
    const newPlanForm = this.shadowRoot.querySelector("#newPlanForm");
    const cancelPlanBtn = this.shadowRoot.querySelector("#cancelPlanBtn");
    const tabList = this.shadowRoot.querySelector("#planTabs");

    newPlanButton.addEventListener("click", () => {
      newPlanDialog.style.display = "flex";
    });

    cancelPlanBtn.addEventListener("click", () => {
      newPlanDialog.style.display = "none";
      newPlanForm.reset();
    });

    newPlanForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = {
        name:
          this.shadowRoot.querySelector("#planNameInput").value.trim() ||
          "New Plan",
        description: this.shadowRoot
          .querySelector("#planDescription")
          .value.trim(),
        startDate:
          this.shadowRoot.querySelector("#planStartDate").value || null,
      };

      this.controller.createNewPlan(formData);
      newPlanDialog.style.display = "none";
      newPlanForm.reset();
    });

    tabList.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (tab) {
        this.controller.switchPlan(tab.dataset.planId);
      }
      if (e.target.classList.contains("delete-tab")) {
        e.stopPropagation();
        const tab = e.target.closest(".tab");
        this.controller.deletePlan(tab.dataset.planId);
      }
    });
  }

  updatePlanTabs() {
    const tabList = this.shadowRoot.querySelector("#planTabs");
    const plans = this.controller.service.getAllPlans();

    tabList.innerHTML = plans
      .map((plan) => {
        return `
        <div class="tab ${
          this.controller.currentPlan?.id === plan.id ? "active" : ""
        }" data-plan-id="${plan.id}">
          <span class="tab-name">${plan.name}</span>
          <span class="delete-tab">×</span>
          ${
            plan.description || plan.startDate
              ? `<div class="tab-tooltip">
                  <div class="tooltip-content">
                    <strong>${plan.name}</strong>
                    ${plan.description ? `<p>${plan.description}</p>` : ""}
                    ${
                      plan.startDate
                        ? `<small>Start Date: ${new Date(
                            plan.startDate
                          ).toLocaleDateString()}</small>`
                        : ""
                    }
                  </div>
                </div>`
              : ""
          }
        </div>
      `;
      })
      .join("");

    // Add positioning for tooltips
    const tabs = this.shadowRoot.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      const tooltip = tab.querySelector(".tab-tooltip");
      if (tooltip) {
        const rect = tab.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top}px`;
      }
    });
  }
}

customElements.define("save-plan", SavePlan);
