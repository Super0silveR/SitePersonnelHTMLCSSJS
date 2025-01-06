// Import Chart.js if using modules, otherwise include in HTML
// import Chart from 'chart.js/auto';

class Transaction {
  constructor(name, amount, type, frequency, startDate) {
    this.id = Date.now() + Math.random();
    this.name = name;
    this.amount = parseFloat(amount);
    this.type = type; // 'earning' or 'spending'
    this.frequency = frequency; // 'once', 'daily', 'weekly', 'monthly', 'yearly'
    this.startDate = new Date(startDate);
    this.created = new Date();
  }
}

class SavePlan {
  constructor() {
    this.transactions = this.loadTransactions();
    this.initializeUI();
    this.setupEventListeners();
    this.updateCharts();
  }

  loadTransactions() {
    return JSON.parse(localStorage.getItem("transactions") || "[]");
  }

  saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
    this.saveTransactions();
    this.updateCharts();
    this.renderTransactionList();
  }

  removeTransaction(id) {
    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.saveTransactions();
    this.updateCharts();
    this.renderTransactionList();
  }

  calculateProjection(months = 12) {
    const projection = Array(months).fill(0);
    const today = new Date();

    this.transactions.forEach((transaction) => {
      const startDate = new Date(transaction.startDate);
      const amount =
        transaction.amount * (transaction.type === "spending" ? -1 : 1);

      for (let i = 0; i < months; i++) {
        const currentDate = new Date(
          today.getFullYear(),
          today.getMonth() + i,
          1
        );

        switch (transaction.frequency) {
          case "once":
            if (i === 0 && startDate <= currentDate) {
              projection[i] += amount;
            }
            break;
          case "daily":
            projection[i] += amount * 30; // Approximate
            break;
          case "weekly":
            projection[i] += amount * 4; // Approximate
            break;
          case "monthly":
            projection[i] += amount;
            break;
          case "yearly":
            if (startDate.getMonth() === currentDate.getMonth()) {
              projection[i] += amount;
            }
            break;
        }
      }
    });

    // Calculate cumulative sum
    return projection.reduce((acc, curr, i) => {
      acc[i] = (acc[i - 1] || 0) + curr;
      return acc;
    }, []);
  }

  updateCharts() {
    const ctx = document.getElementById("projectionChart").getContext("2d");
    const projection = this.calculateProjection();
    const labels = Array(12)
      .fill()
      .map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        return date.toLocaleString("default", {
          month: "short",
          year: "2-digit",
        });
      });

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: document.getElementById("chartType").value,
      data: {
        labels: labels,
        datasets: [
          {
            label: "Balance Projection",
            data: projection,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  renderTransactionList() {
    const container = document.getElementById("transactionList");
    container.innerHTML = "";

    const grouped = this.transactions.reduce((acc, t) => {
      acc[t.type] = acc[t.type] || [];
      acc[t.type].push(t);
      return acc;
    }, {});

    ["earning", "spending"].forEach((type) => {
      if (grouped[type]) {
        const section = document.createElement("div");
        section.className = `transaction-group ${type}`;
        section.innerHTML = `<h3>${
          type.charAt(0).toUpperCase() + type.slice(1)
        }s</h3>`;

        grouped[type].forEach((t) => {
          const item = document.createElement("div");
          item.className = "transaction-item";
          item.innerHTML = `
                        <span>${t.name}</span>
                        <span>$${t.amount}</span>
                        <span>${t.frequency}</span>
                        <button onclick="savePlan.removeTransaction('${t.id}')">×</button>
                    `;
          section.appendChild(item);
        });

        container.appendChild(section);
      }
    });
  }

  initializeUI() {
    const contentHolder = document.querySelector(".ContentHolder");
    contentHolder.innerHTML = `
            <div class="save-plan-container">
                <div class="form-section">
                    <h2>Add Transaction</h2>
                    <form id="transactionForm">
                        <input type="text" id="name" placeholder="Transaction Name" required>
                        <input type="number" id="amount" placeholder="Amount" step="0.01" required>
                        <select id="type" required>
                            <option value="earning">Earning</option>
                            <option value="spending">Spending</option>
                        </select>
                        <select id="frequency" required>
                            <option value="once">Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <input type="date" id="startDate" required>
                        <button type="submit">Add Transaction</button>
                    </form>
                </div>
                
                <div class="chart-section">
                    <select id="chartType" onchange="savePlan.updateCharts()">
                        <option value="line">Line Chart</option>
                        <option value="bar">Bar Chart</option>
                    </select>
                    <canvas id="projectionChart"></canvas>
                </div>
                
                <div id="transactionList" class="transaction-list"></div>
            </div>
        `;
  }

  setupEventListeners() {
    document
      .getElementById("transactionForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const transaction = new Transaction(
          document.getElementById("name").value,
          document.getElementById("amount").value,
          document.getElementById("type").value,
          document.getElementById("frequency").value,
          document.getElementById("startDate").value
        );
        this.addTransaction(transaction);
        e.target.reset();
      });
  }
}

// Initialize the application
const savePlan = new SavePlan();
