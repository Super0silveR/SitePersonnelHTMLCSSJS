export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

export const DEFAULT_COLORS = {
  [TRANSACTION_TYPES.INCOME]: "#4CAF50",
  [TRANSACTION_TYPES.EXPENSE]: "#f44336",
};

export function generateTransactionColor(type) {
  return DEFAULT_COLORS[type] || "#2196F3";
}

export function calculateProjection(initialAmount, transactions, months = 12) {
  let projection = Array(months).fill(initialAmount);

  transactions.forEach((transaction) => {
    const monthlyAmount =
      transaction.type === TRANSACTION_TYPES.INCOME
        ? transaction.amount
        : -transaction.amount;

    for (let i = 0; i < months; i++) {
      projection[i] += monthlyAmount;
    }
  });

  return projection;
}
