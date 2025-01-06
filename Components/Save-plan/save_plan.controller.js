import SavePlanService from "./save_plan.service.js";
import SavePlanChart from "./save_plan.chart.js";
import {
  calculateProjection,
  generateTransactionColor,
  TRANSACTION_TYPES,
} from "./save_plan.utils.js";

export default class SavePlanController {
  constructor(component) {
    this.component = component;
    this.service = new SavePlanService();
    this.chart = null;
    this.currentPlan = null;
  }

  initialize(chartContext) {
    this.chart = new SavePlanChart(chartContext);
    this.setupEventListeners();
    this.loadPlans();
  }

  setupEventListeners() {
    const form = this.component.shadowRoot.querySelector("#savingsForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }

  handleFormSubmit() {
    const formData = this.getFormData();
    if (!this.currentPlan) {
      this.currentPlan = this.service.createPlan({
        name: "Default Plan",
        initialAmount: formData.initialAmount,
      });
    }

    const transaction = {
      name: "Monthly Contribution",
      type: TRANSACTION_TYPES.INCOME,
      amount: formData.monthlyContribution,
      frequency: "monthly",
      color: generateTransactionColor(TRANSACTION_TYPES.INCOME),
    };

    this.service.addTransaction(this.currentPlan.id, transaction);
    this.updateChart();
  }

  getFormData() {
    return {
      initialAmount:
        parseFloat(
          this.component.shadowRoot.querySelector("#initialAmount").value
        ) || 0,
      monthlyContribution:
        parseFloat(
          this.component.shadowRoot.querySelector("#monthlyContribution").value
        ) || 0,
      interestRate:
        parseFloat(
          this.component.shadowRoot.querySelector("#interestRate").value
        ) || 0,
      months:
        parseInt(this.component.shadowRoot.querySelector("#months").value) ||
        12,
    };
  }

  updateChart() {
    if (this.currentPlan && this.chart) {
      const formData = this.getFormData();
      const projection = calculateProjection(
        formData.initialAmount,
        this.currentPlan.transactions,
        formData.months
      );
      this.chart.updateChart(this.currentPlan, projection);
    }
  }

  loadPlans() {
    const plans = this.service.getAllPlans();
    if (plans.length > 0) {
      this.switchPlan(plans[0].id);
    }
    this.updatePlanTabs();
  }

  createNewPlan(formData) {
    const plan = this.service.createPlan({
      name: formData.name || "New Plan",
      description: formData.description || "",
      startDate: formData.startDate || new Date().toISOString().split("T")[0],
      initialAmount: 0,
      transactions: [],
    });
    this.switchPlan(plan.id);
    this.updatePlanTabs();
  }

  switchPlan(planId) {
    this.currentPlan = this.service.getAllPlans().find((p) => p.id === planId);
    this.updatePlanTabs();
    this.updateFormWithPlanData();
    this.updateChart();
  }

  deletePlan(planId) {
    if (confirm("Are you sure you want to delete this plan?")) {
      this.service.deletePlan(planId);
      const plans = this.service.getAllPlans();
      this.currentPlan = plans.length > 0 ? plans[0] : null;
      this.updatePlanTabs();
      if (this.currentPlan) {
        this.updateFormWithPlanData();
        this.updateChart();
      }
    }
  }

  updatePlanTabs() {
    const tabList = this.component.shadowRoot.querySelector("#planTabs");
    const plans = this.service.getAllPlans();

    tabList.innerHTML = plans
      .map(
        (plan) => `
      <div class="tab ${
        this.currentPlan?.id === plan.id ? "active" : ""
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
    `
      )
      .join("");
  }

  updateFormWithPlanData() {
    if (!this.currentPlan) return;

    const form = this.component.shadowRoot.querySelector("#savingsForm");
    form.querySelector("#initialAmount").value =
      this.currentPlan.initialAmount || 0;

    // If there's a monthly contribution transaction, set its value
    const monthlyContribution = this.currentPlan.transactions.find(
      (t) => t.frequency === "monthly" && t.type === TRANSACTION_TYPES.INCOME
    );
    form.querySelector("#monthlyContribution").value =
      monthlyContribution?.amount || 0;
  }
}
