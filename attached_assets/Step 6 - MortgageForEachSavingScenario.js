const {
  calculateLoanAmountFromMonthlyPayment,
} = require('./Step 2 - LoanAmountFromMonthlyPayment');

function calculateMortgageForEachSavingScenario(
  allSavingScenarios,
  downPayment,
  annualInterestRate,
  loanTermYears,
  hoaFees = 0, // Default HOA fees to $0
  homeownersInsurance = 1915, // Default Homeowners Insurance to $1,915/year
  pmiInput = null, // Optional PMI as input (annual), default to null
  propertyTaxInput = null // Optional property tax as input (annual dollar amount), default to null
) {
  if (allSavingScenarios[0].savingsPercentage) {
    throw new Error('input does not have correct object');
  }

  if (allSavingScenarios[0].mortgagePaymentStats) {
    throw new Error('input does not have correct object');
  }

  const results = [];

  // Scenario counter
  let i = 0;

  for (let scenario of allSavingScenarios) {
    i += 1;
    try {
      const mortgagePaymentStats = calculateLoanAmountFromMonthlyPayment({
        desiredMonthlyPayment: scenario.mortgage.mortgagePayment,
        downPayment,
        annualInterestRate,
        loanTermYears,
      });
      results.push({
        description: `${scenario.savings.percentage * 100}% Saving Scenario`,
        mortgagePaymentStats,
        scenario,
      });
    } catch (error) {
      results.push({ savingsPercentage: scenario, error: error.message });
    }
  }

  console.log('Step 6 Complete');

  return results;
}

// Example usage:

// const allScenarios = calculateMortgageForEachSavingScenarios(annualNetIncome);

//   console.dir(allScenarios, { depth: null });

module.exports = { calculateMortgageForEachSavingScenario };
