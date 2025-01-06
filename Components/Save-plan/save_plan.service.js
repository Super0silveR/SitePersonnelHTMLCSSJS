export default class SavePlanService {
  constructor() {
    this.STORAGE_KEY = "savings-plans";
  }

  // Plan Management
  getAllPlans() {
    const plans = localStorage.getItem(this.STORAGE_KEY);
    return plans ? JSON.parse(plans) : [];
  }

  createPlan(plan) {
    const plans = this.getAllPlans();
    plan.id = Date.now().toString();
    plan.transactions = [];
    plans.push(plan);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plans));
    return plan;
  }

  // Transaction Management
  addTransaction(planId, transaction) {
    const plans = this.getAllPlans();
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      transaction.id = Date.now().toString();
      plan.transactions.push(transaction);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plans));
      return transaction;
    }
    return null;
  }

  // CSV Export
  exportToCSV(planId) {
    const plan = this.getAllPlans().find((p) => p.id === planId);
    if (!plan) return null;

    const headers = ["Date", "Name", "Type", "Amount", "Frequency"];
    const rows = plan.transactions.map((t) => [
      t.date,
      t.name,
      t.type,
      t.amount,
      t.frequency,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  deletePlan(planId) {
    let plans = this.getAllPlans();
    plans = plans.filter((p) => p.id !== planId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plans));
  }
}
