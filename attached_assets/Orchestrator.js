const { debtCheck } = require('./Step 0.1 - DebtCheck.js');
const {
  calculateMaxMortgagePayment,
} = require('./Step 1 - MaxMortgagePayment.js');
const {
  calculateLoanAmountFromMonthlyPayment,
} = require('./Step 2 - LoanAmountFromMonthlyPayment.js');

const { calculateNetIncome } = require('./Step 3 - NetIncome');
const {
  calculateSimpleMonthlyBudget,
} = require('./Step 4 - SimpleMonthlyBudgetR.js');
const {
  calculateMortgagePayment,
} = require('./Step 5.1 - ComplexBudgetMortgagePayment.js');
const {
  calculateComplexBudgetsForSavingsPercentages,
} = require('./Step 5 - ComplexBudgetsForSavingsPercentages.js');
const {
  calculateMortgageForEachSavingScenario,
} = require('./Step 6 - MortgageForEachSavingScenario.js');

function calculateAllScenarios({
  householdIncome,
  downPayment,
  annualInterestRate,
  loanTermYears,
  state,
  filingStatus,
  hoaFees = 0, // Default HOA fees to $0
  homeownersInsurance = 1915, // Default Homeowners Insurance to $1,915/year
  pmiInput = null, // Optional PMI as input (annual), default to null
  propertyTaxInput = null, // Optional property tax as input (annual dollar amount), default to null
  pretaxContributions = 0,
  dependents = 0,
  monthlyDebt,
} = {}) {
  // STEP 0.1
  // Are current current monthly debts greater than 6% of gross income?
  const debtOutput = debtCheck(householdIncome, monthlyDebt);
  let maxMonthlyMortgagePayment = {};

  // STEP 1
  // If debts are less than 6% of income, then calculate Mortgage based on DIR 28% Rule
  if (debtOutput.below6) {
    maxMonthlyMortgagePayment = calculateMaxMortgagePayment(householdIncome);
  }

  // If debts are more than 6% of income
  if (!debtOutput.below6) {
    console.log('debtPercentage', debtOutput.debtPercentage);
    // determine how much of the 36% DIR user has to spend on mortgage payment
    const allowedDIR = 0.36 - debtOutput.debtPercentage;
    console.log('allowedDIR', allowedDIR);
    maxMonthlyMortgagePayment = calculateMaxMortgagePayment(
      householdIncome,
      allowedDIR
    );
  }

  // STEP 2
  // returns an object. Calculate all the stats assoicated with the max purchase price we'd recommend
  const maxPurchasePriceStats = calculateLoanAmountFromMonthlyPayment({
    desiredMonthlyPayment: maxMonthlyMortgagePayment,
    downPayment,
    annualInterestRate,
    loanTermYears,
  });

  // STEP 3
  // calculate NetIncome based on Gross Income
  const netIncomeAnnualStats = calculateNetIncome(
    householdIncome,
    state,
    filingStatus
  );

  // STEP 4
  // calculate the 50/30/20 budget given the Max Mortgage Payment based on DIR 28% rule
  const baselineBudgetDIR28 = calculateSimpleMonthlyBudget({
    annualNetIncome: netIncomeAnnualStats.netIncome,
    monthlyMortgagePayment: maxMonthlyMortgagePayment,
    monthlyDebt,
  });

  const maxMortgageWithBaselineBudgetOutput = {
    description:
      'Max Mortgage Scenario with as close to 50/30/20 budget as possible',
    mortgagePaymentStats: maxPurchasePriceStats,
    scenario: baselineBudgetDIR28,
  };

  //  STEP 5
  // Calculate the complex budgets for all saving percentage scenarios.
  // Main output is the mortgage payment given the desired saving percentage.
  const allSavingScenariosStats = calculateComplexBudgetsForSavingsPercentages(
    netIncomeAnnualStats.netIncome,
    monthlyDebt
  );

  // STEP 6
  // calculate home prices, loan amounts and mortage stats for the mortgage payments of each saving scenario.
  const savingsScenarioStats = calculateMortgageForEachSavingScenario(
    allSavingScenariosStats,
    downPayment,
    annualInterestRate,
    loanTermYears,
    (hoaFees = 0), // Default HOA fees to $0
    (homeownersInsurance = 1915), // Default Homeowners Insurance to $1,915/year
    (pmiInput = null), // Optional PMI as input (annual), default to null
    (propertyTaxInput = null) // Optional property tax as input (annual dollar amount), default to null
  );

  // console.log('Income Summary:', netIncomeAnnualStats);
  // console.log('-----------------------------------');
  // console.log(
  //   'Debt Check below 8%?',
  //   debtOutput.below6,
  //   debtOutput.debtPercentage
  // );
  // console.log(
  //   'Max Mortgage w/ Baseline Budget:',
  //   maxMortgageWithBaselineBudgetOutput
  // );
  // console.log('-----------------------------------');
  // console.log('All Saving Scenarios:');
  // console.dir(result, { depth: null });

  return {
    incomeSummary: netIncomeAnnualStats,
    debtCheck: {
      debCheckOutcome: debtOutput.below6,
      debtCheckPercent: debtOutput.debtPercentage,
    },
    maxMortgageStats: maxMortgageWithBaselineBudgetOutput,
    allSavingsScenarios: savingsScenarioStats,
  };
}

// Example usage:
// Old Test
// const householdIncome = 358_000;
// const downPayment = 150_000;
// const annualInterestRate = 6.375;
// const loanTermYears = 30;
// const state = 'NJ';
// const filingStatus = 'married';
// const monthlyDebt = 0;

// const result = calculateAllScenarios(
//   householdIncome,
//   downPayment,
//   annualInterestRate,
//   loanTermYears,
//   state,
//   filingStatus
// );

// New Test

const result = calculateAllScenarios({
  householdIncome: 368_000,
  downPayment: 150_000,
  annualInterestRate: 6.375,
  loanTermYears: 30,
  state: 'NJ',
  filingStatus: 'married',
  monthlyDebt: 3000,
});

console.dir(result, { depth: null });
