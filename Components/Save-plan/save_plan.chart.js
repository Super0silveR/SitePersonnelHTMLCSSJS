export default class SavePlanChart {
  constructor(ctx) {
    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Amount ($)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Months",
            },
          },
        },
      },
    });
  }

  updateChart(plan, projection) {
    const labels = Array.from(
      { length: projection.length },
      (_, i) => `Month ${i + 1}`
    );

    // Create dataset for total projection
    const datasets = [
      {
        label: "Total Projection",
        data: projection,
        borderColor: "#2196F3",
        tension: 0.1,
      },
    ];

    // Add individual transaction datasets if they exist
    if (plan.transactions.length > 0) {
      plan.transactions.forEach((transaction) => {
        datasets.push({
          label: transaction.name,
          data: Array(projection.length).fill(transaction.amount),
          borderColor: transaction.color,
          hidden: true,
        });
      });
    }

    this.chart.data.labels = labels;
    this.chart.data.datasets = datasets;
    this.chart.update();
  }

  toggleTransaction(transactionId, visible) {
    const dataset = this.chart.data.datasets.find(
      (ds) => ds.label === transactionId
    );
    if (dataset) {
      dataset.hidden = !visible;
      this.chart.update();
    }
  }
}
