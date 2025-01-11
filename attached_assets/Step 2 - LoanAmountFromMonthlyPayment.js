function calculateLoanAmountFromMonthlyPayment({
  desiredMonthlyPayment,
  downPayment,
  annualInterestRate,
  loanTermYears,
  hoaFees = 0, // Default HOA fees to $0
  homeownersInsurance = 1915, // Default Homeowners Insurance to $1,915/year
  pmiInput = null, // Optional PMI as input (annual), default to null
  propertyTaxInput = null, // Optional property tax as input (annual dollar amount), default to null
} = {}) {
  // Convert annual interest rate to monthly interest rate
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  // Calculate total number of monthly payments
  const totalPayments = loanTermYears * 12;

  // Convert annual homeowners insurance to monthly
  const monthlyHomeownersInsurance = homeownersInsurance / 12;

  // Helper function to calculate principal and interest
  function calculateMonthlyPrincipalAndInterest(loanAmount) {
    return (
      (loanAmount *
        (monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, totalPayments))) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1)
    );
  }

  // Start with a better initial guess
  let loanAmount = desiredMonthlyPayment * 50; // New initial guess: $50 per $1,000 loan
  // const epsilon = 0.01; // Error margin
  const maxIterations = 1000;
  let iteration = 0;

  // Initialize other variables
  let homePrice = loanAmount + downPayment; // H = P + D
  let propertyTax =
    propertyTaxInput !== null ? propertyTaxInput / 12 : (0.01 * homePrice) / 12; // Default logic or custom
  let downPaymentPercentage = downPayment / homePrice;
  let pmi = downPaymentPercentage >= 0.2 ? 0 : (0.0046 * loanAmount) / 12; // Default PMI logic
  let totalPayment = 0;
  let monthlyMortgagePayment = 0;

  // Iterative approximation
  while (iteration < maxIterations) {
    iteration++;
    homePrice = loanAmount + downPayment; // H = P + D

    // Property Tax logic
    propertyTax =
      propertyTaxInput !== null
        ? propertyTaxInput / 12 // If provided, use the input (convert annual to monthly)
        : (0.01 * homePrice) / 12; // Default logic: 1% of home price annually

    // PMI logic
    if (pmiInput !== null) {
      // If PMI is provided, use it directly (convert annual to monthly)
      pmi = pmiInput / 12;
    } else {
      // Default PMI logic: based on loan amount and down payment
      downPaymentPercentage = downPayment / homePrice;
      pmi = downPaymentPercentage >= 0.2 ? 0 : (0.0046 * loanAmount) / 12;
    }

    monthlyMortgagePayment = calculateMonthlyPrincipalAndInterest(loanAmount); // Mortgage payment

    // Total monthly payment including all components
    totalPayment =
      monthlyMortgagePayment +
      propertyTax +
      pmi +
      hoaFees +
      monthlyHomeownersInsurance;

    // Adjust the loan amount based on the difference
    const paymentDifference = desiredMonthlyPayment - totalPayment;

    // Gradually reduce adjustment size as the difference gets smaller
    const loanAdjustment = Math.max(paymentDifference / 10, 1000); // At least $1,000 adjustment

    // Break the loop if the payment difference becomes negative
    // Might need to revisit this and use epsilon strategy.
    if (paymentDifference < 0) {
      break;
    }

    // Update the loan amount
    loanAmount += loanAdjustment;

    // console.log('i', iteration);
    // console.log('totalPayment', totalPayment);
    // console.log('loanAmount', loanAmount);
  }

  console.log('Step 2 Complete');

  return {
    purchasePrice: +loanAmount.toFixed(2) + +downPayment.toFixed(2),
    loanAmount: +loanAmount.toFixed(2), // Return rounded loan amount
    downpayment: +downPayment.toFixed(2),
    totalPayment: +totalPayment.toFixed(2),
    mortgagePayment: +monthlyMortgagePayment.toFixed(2),
    propertyTax: +propertyTax.toFixed(2),
    pmi: +pmi.toFixed(2),
    homeownersInsurance: +monthlyHomeownersInsurance.toFixed(2),
    hoa: +hoaFees.toFixed(2),
  };
}

// Example usage:
// const desiredMonthlyPayment = 8353.33; // Desired total monthly payment in dollars
// const downPayment = 150000; // Downpayment in dollars
// const annualInterestRate = 6.375; // Annual interest rate in percentage
// const loanTermYears = 30; // Loan term in years
// const hoaFees = 0; // Monthly HOA fees in dollars
// const homeownersInsurance = 2200; // Annual Homeowners Insurance in dollars
// const pmiInput = 1200; // Custom annual PMI
// const propertyTaxInput = 4800; // Custom annual property tax in dollars

// const loanAmount = calculateLoanAmountFromMonthlyPayment(
//   desiredMonthlyPayment,
//   downPayment,
//   annualInterestRate,
//   loanTermYears,
//   hoaFees,
//   homeownersInsurance,
//   pmiInput, // Custom PMI
//   propertyTaxInput // Custom Property Tax (in dollars)
// );

// console.log('Result:', loanAmount);

module.exports = { calculateLoanAmountFromMonthlyPayment };
