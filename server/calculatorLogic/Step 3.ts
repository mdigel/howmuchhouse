interface LoanCalculationInput {
  desiredMonthlyPayment: number;
  downPayment: number;
  annualInterestRate: number;
  loanTermYears: number;
  hoaFees?: number; // Optional, defaults to 0
  homeownersInsurance?: number; // Optional, defaults to 1915 (annual)
  pmiInput?: number | null; // Optional, annual PMI, default null
  propertyTaxInput?: number | null; // Optional, annual property tax, default null
}

interface LoanCalculationResult {
  purchasePrice: number;
  loanAmount: number;
  downpayment: number;
  totalPayment: number;
  mortgagePayment: number;
  propertyTax: number;
  pmi: number;
  homeownersInsurance: number;
  hoa: number;
}

function calculateLoanAmountFromMonthlyPayment({
  desiredMonthlyPayment,
  downPayment,
  annualInterestRate,
  loanTermYears,
  hoaFees = 0,
  homeownersInsurance = 1915,
  pmiInput = null,
  propertyTaxInput = null,
}: LoanCalculationInput): LoanCalculationResult {
  // Convert annual interest rate to monthly interest rate
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  // Calculate total number of monthly payments
  const totalPayments = loanTermYears * 12;

  // Convert annual homeowners insurance to monthly
  const monthlyHomeownersInsurance = homeownersInsurance / 12;

  // Helper function to calculate principal and interest
  function calculateMonthlyPrincipalAndInterest(loanAmount: number): number {
    return (
      (loanAmount *
        (monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, totalPayments))) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1)
    );
  }

  let loanAmount = desiredMonthlyPayment * 50; // Initial guess
  const maxIterations = 1000;
  let iteration = 0;

  let homePrice = loanAmount + downPayment; // H = P + D
  let propertyTax =
    propertyTaxInput !== null ? propertyTaxInput / 12 : (0.01 * homePrice) / 12;
  let downPaymentPercentage = downPayment / homePrice;
  let pmi = downPaymentPercentage >= 0.2 ? 0 : (0.0046 * loanAmount) / 12;
  let totalPayment = 0;
  let monthlyMortgagePayment = 0;

  while (iteration < maxIterations) {
    iteration++;
    homePrice = loanAmount + downPayment; // H = P + D

    propertyTax =
      propertyTaxInput !== null
        ? propertyTaxInput / 12
        : (0.01 * homePrice) / 12;

    if (pmiInput !== null) {
      pmi = pmiInput / 12;
    } else {
      downPaymentPercentage = downPayment / homePrice;
      pmi = downPaymentPercentage >= 0.2 ? 0 : (0.0046 * loanAmount) / 12;
    }

    monthlyMortgagePayment = calculateMonthlyPrincipalAndInterest(loanAmount);

    totalPayment =
      monthlyMortgagePayment +
      propertyTax +
      pmi +
      hoaFees +
      monthlyHomeownersInsurance;

    const paymentDifference = desiredMonthlyPayment - totalPayment;

    const loanAdjustment = Math.max(paymentDifference / 10, 1000);

    if (paymentDifference < 0) {
      break;
    }

    loanAmount += loanAdjustment;
  }

  console.log('Step 3 Complete');

  return {
    purchasePrice: Math.round((loanAmount + downPayment) * 100) / 100,
    loanAmount: Math.round(loanAmount * 100) / 100,
    downpayment: Math.round(downPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    mortgagePayment: Math.round(monthlyMortgagePayment * 100) / 100,
    propertyTax: Math.round(propertyTax * 100) / 100,
    pmi: Math.round(pmi * 100) / 100,
    homeownersInsurance: Math.round(monthlyHomeownersInsurance * 100) / 100,
    hoa: Math.round(hoaFees * 100) / 100,
  };
}

export {
  calculateLoanAmountFromMonthlyPayment,
  LoanCalculationInput,
  LoanCalculationResult,
};