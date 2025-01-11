// Import or include the function as needed
const {
  calculateLoanAmountFromMonthlyPayment,
} = require('./Step 2 - LoanAmountFromMonthlyPayment.js');

// Test cases
const testCases = [
  // Existing test cases
  {
    description: 'Basic test with typical values #1',
    inputs: {
      desiredMonthlyPayment: 2774,
      downPayment: 69840,
      annualInterestRate: 6.699,
      loanTermYears: 30,
      hoaFees: 0,
      homeownersInsurance: 1915,
    },
    expected: {
      purchasePrice: 403540.0,
      loanAmount: 333700.0,
      downpayment: 69840.0,
      totalPayment: 2776.86,
      mortgagePayment: 2153.07,
      propertyTax: 336.28,
      pmi: 127.92,
      homeownersInsurance: 159.58,
      hoa: 0,
    },
  },
  {
    description: 'Basic test with typical values #2',
    inputs: {
      desiredMonthlyPayment: 8353.33,
      downPayment: 150000,
      annualInterestRate: 6.375,
      loanTermYears: 30,
      hoaFees: 0,
      homeownersInsurance: 2200,
    },
    expected: {
      purchasePrice: 1229666.5,
      loanAmount: 1079666.5,
      downpayment: 150000,
      totalPayment: 8357.64,
      mortgagePayment: 6735.71,
      propertyTax: 1024.72,
      pmi: 413.87,
      homeownersInsurance: 183.33,
      hoa: 0,
    },
  },

  // New Edge Cases
  //   {
  //     description: 'Custom PMI and property taxes',
  //     inputs: {
  //       desiredMonthlyPayment: 4000,
  //       downPayment: 150000,
  //       annualInterestRate: 6.5,
  //       loanTermYears: 30,
  //       hoaFees: 200,
  //       homeownersInsurance: 1500,
  //       pmiInput: 2400, // Annual PMI
  //       propertyTaxInput: 5000, // Annual Property Tax
  //     },
  //     expected: {
  //       pmi: 200, // 2400 / 12
  //       propertyTax: 416.67, // 5000 / 12
  //     },
  //   },
  //   {
  //     description: 'Down payment exactly 20% of home price',
  //     inputs: {
  //       desiredMonthlyPayment: 5000,
  //       downPayment: 200000,
  //       annualInterestRate: 6,
  //       loanTermYears: 30,
  //       hoaFees: 0,
  //       homeownersInsurance: 2000,
  //     },
  //     expected: {
  //       pmi: 0, // No PMI
  //     },
  //   },
  //   {
  //     description: 'High HOA fees',
  //     inputs: {
  //       desiredMonthlyPayment: 6000,
  //       downPayment: 100000,
  //       annualInterestRate: 4.5,
  //       loanTermYears: 15,
  //       hoaFees: 1000,
  //       homeownersInsurance: 1200,
  //     },
  //     expected: {
  //       totalPaymentIncludesHOA: true, // HOA should be part of total payment
  //     },
  //   },
  //   {
  //     description: 'Zero interest rate',
  //     inputs: {
  //       desiredMonthlyPayment: 2000,
  //       downPayment: 100000,
  //       annualInterestRate: 0, // No interest
  //       loanTermYears: 30,
  //       hoaFees: 0,
  //       homeownersInsurance: 1500,
  //     },
  //     expected: {
  //       interest: 0, // Should have no interest portion
  //     },
  //   },
  //   {
  //     description: 'Short loan term (5 years)',
  //     inputs: {
  //       desiredMonthlyPayment: 10000,
  //       downPayment: 50000,
  //       annualInterestRate: 7,
  //       loanTermYears: 5, // Short term
  //       hoaFees: 0,
  //       homeownersInsurance: 1500,
  //     },
  //     expected: {
  //       loanTerm: 'short', // Check correctness for short loan terms
  //     },
  //   },
  //   {
  //     description: 'Very high desired monthly payment',
  //     inputs: {
  //       desiredMonthlyPayment: 20000,
  //       downPayment: 100000,
  //       annualInterestRate: 5,
  //       loanTermYears: 30,
  //       hoaFees: 0,
  //       homeownersInsurance: 1800,
  //     },
  //     expected: {
  //       loanAmount: 'high', // Ensure high payment results in a high loan amount
  //     },
  //   },
  //   {
  //     description: 'Very low desired monthly payment',
  //     inputs: {
  //       desiredMonthlyPayment: 500,
  //       downPayment: 50000,
  //       annualInterestRate: 5,
  //       loanTermYears: 30,
  //       hoaFees: 0,
  //       homeownersInsurance: 1500,
  //     },
  //     expected: {
  //       loanAmount: 'low', // Ensure low payment results in a realistic loan amount
  //     },
  //   },
];

// Test runner
testCases.forEach(({ description, inputs, expected }, index) => {
  console.log(`Test Case ${index + 1}: ${description}`);
  const result = calculateLoanAmountFromMonthlyPayment(
    inputs.desiredMonthlyPayment,
    inputs.downPayment,
    inputs.annualInterestRate,
    inputs.loanTermYears,
    inputs.hoaFees,
    inputs.homeownersInsurance,
    inputs.pmiInput || null,
    inputs.propertyTaxInput || null
  );

  //   console.log('Result:', result);

  // Validate loan amount matches expected tolerance
  if (expected.loanAmount) {
    console.log(
      'Approx Loan Amount Match:',
      Math.abs(result.loanAmount - expected.loanAmount) < 5000 // small allowance
    );
  }

  // Validate PMI
  if (expected.pmi !== undefined) {
    console.log('PMI Match:', Math.abs(result.pmi - expected.pmi) < 1);
  }

  // Validate Property Tax
  if (expected.propertyTax !== undefined) {
    console.log(
      'Property Tax Match:',
      Math.abs(result.propertyTax - expected.propertyTax) < 1
    );
  }
  console.log(
    'Total Payment = Mortgage + All Fees?',
    Math.abs(
      result.totalPayment -
        (result.mortgagePayment +
          result.propertyTax +
          result.pmi +
          result.hoa +
          result.homeownersInsurance)
    ) < 10
  );
  console.log('-----------------------------------');
});
