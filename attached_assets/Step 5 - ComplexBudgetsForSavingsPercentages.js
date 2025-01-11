const {
  calculateComplexBudgetMortgagePayment,
} = require('./Step 5.1 - ComplexBudgetMortgagePayment.js');

function calculateComplexBudgetsForSavingsPercentages(
  annualNetIncome,
  monthlyDebt
) {
  //   const savingsPercentages = [
  //     0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
  //   ];

  // For Testing
  const savingsPercentagesArray = [0.15, 0.2, 0.25];

  const results = [];

  for (let savingsPercentage of savingsPercentagesArray) {
    try {
      const complexBudgetBreakdown = calculateComplexBudgetMortgagePayment({
        annualNetIncome,
        savingsPercentage,
        monthlyDebt,
      });

      results.push({
        ...complexBudgetBreakdown,
      });
    } catch (error) {
      results.push({
        savingsPercentage: savingsPercentage,
        error: error.message,
      });
    }
  }

  console.log('Step 5 Compelte');

  return results;
}

// Example
// const allScenarios =
//   calculateMortgagePaymentsForSavingsPercentages(annualNetIncome);

//   console.dir(allScenarios, { depth: null });

module.exports = { calculateComplexBudgetsForSavingsPercentages };
