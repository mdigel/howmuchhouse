import type {
  BasicInputType,
  AdvancedInputType,
  IncomeSummary,
  MortgagePaymentStats,
  HomePrice,
  CalculatorResults
} from './calculatorTypes';

function debtCheck(grossIncome: number, monthlyDebt: number): { below6: boolean; debtPercentage: number } {
  const monthlyGrossIncome = grossIncome / 12;
  const debtPercentage = monthlyDebt / monthlyGrossIncome;
  return {
    below6: debtPercentage < 0.06,
    debtPercentage
  };
}

function calculateMaxMortgagePayment(grossIncome: number, allowedDIR: number = 0.28): number {
  const monthlyGrossIncome = grossIncome / 12;
  return monthlyGrossIncome * allowedDIR;
}

function calculateNetIncome(
  grossIncome: number,
  state: string,
  filingStatus: string,
  pretaxContributions: number = 0,
  dependents: number = 0
): IncomeSummary {
  // Federal tax brackets for 2024
  const federalTaxBrackets = {
    single: [
      { rate: 0.1, threshold: 0 },
      { rate: 0.12, threshold: 11_000 },
      { rate: 0.22, threshold: 44_725 },
      { rate: 0.24, threshold: 95_375 },
      { rate: 0.32, threshold: 182_100 },
      { rate: 0.35, threshold: 231_250 },
      { rate: 0.37, threshold: 578_125 },
    ],
    married: [
      { rate: 0.1, threshold: 0 },
      { rate: 0.12, threshold: 22_000 },
      { rate: 0.22, threshold: 89_450 },
      { rate: 0.24, threshold: 190_750 },
      { rate: 0.32, threshold: 364_200 },
      { rate: 0.35, threshold: 462_500 },
      { rate: 0.37, threshold: 693_750 },
    ],
  };

  // State income tax rates (simplified)
  const stateTaxRates: Record<string, number> = {
    AL: 0.05, AK: 0.0, AZ: 0.025, AR: 0.044, CA: 0.133,
    CO: 0.044, CT: 0.0699, DE: 0.066, FL: 0.0, GA: 0.0575,
    HI: 0.11, ID: 0.058, IL: 0.0495, IN: 0.0315, IA: 0.06,
    KS: 0.057, KY: 0.045, LA: 0.0425, ME: 0.0715, MD: 0.0575,
    MA: 0.05, MI: 0.0425, MN: 0.0985, MS: 0.05, MO: 0.05,
    MT: 0.0675, NE: 0.0664, NV: 0.0, NH: 0.0, NJ: 0.1075,
    NM: 0.059, NY: 0.109, NC: 0.0475, ND: 0.0264, OH: 0.0399,
    OK: 0.0475, OR: 0.099, PA: 0.0307, RI: 0.0599, SC: 0.065,
    SD: 0.0, TN: 0.0, TX: 0.0, UT: 0.0485, VT: 0.0875,
    VA: 0.0575, WA: 0.0, WV: 0.065, WI: 0.0765, WY: 0.0,
    DC: 0.1075,
  };

  const standardDeductions = {
    single: 13_850,
    married: 27_700,
  };

  const standardDeduction = standardDeductions[filingStatus as keyof typeof standardDeductions] || 0;
  const adjustedGrossIncome = grossIncome - pretaxContributions;
  let taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction);

  // Calculate federal tax
  const brackets = federalTaxBrackets[filingStatus as keyof typeof federalTaxBrackets];
  let federalTax = 0;
  
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].threshold) {
      federalTax += (taxableIncome - brackets[i].threshold) * brackets[i].rate;
      taxableIncome = brackets[i].threshold;
    }
  }

  const stateTaxRate = stateTaxRates[state] || 0;
  const stateTax = adjustedGrossIncome * stateTaxRate;

  const socialSecurityWageBase = 160_200;
  const socialSecurityTax = Math.min(adjustedGrossIncome, socialSecurityWageBase) * 0.062;
  const medicareTax = adjustedGrossIncome * 0.0145;
  const additionalMedicareTax = adjustedGrossIncome > 250_000 ? (adjustedGrossIncome - 250_000) * 0.009 : 0;

  const totalTax = federalTax + stateTax + socialSecurityTax + medicareTax + additionalMedicareTax;
  const childTaxCredit = dependents * 2_000;
  const netIncome = adjustedGrossIncome - totalTax + childTaxCredit;

  return {
    grossIncome: +grossIncome.toFixed(2),
    adjustedGrossIncome: +adjustedGrossIncome.toFixed(2),
    federalTax: +federalTax.toFixed(2),
    stateTax: +stateTax.toFixed(2),
    socialSecurityTax: +socialSecurityTax.toFixed(2),
    medicareTax: +medicareTax.toFixed(2),
    additionalMedicareTax: +additionalMedicareTax.toFixed(2),
    totalTax: +totalTax.toFixed(2),
    childTaxCredit: +childTaxCredit.toFixed(2),
    netIncome: +netIncome.toFixed(2),
  };
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
}: {
  desiredMonthlyPayment: number;
  downPayment: number;
  annualInterestRate: number;
  loanTermYears: number;
  hoaFees?: number;
  homeownersInsurance?: number;
  pmiInput?: number | null;
  propertyTaxInput?: number | null;
}): MortgagePaymentStats {
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const totalPayments = loanTermYears * 12;
  const monthlyHomeownersInsurance = homeownersInsurance / 12;

  function calculateMonthlyPrincipalAndInterest(loanAmount: number): number {
    return (
      (loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments))) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1)
    );
  }

  let loanAmount = desiredMonthlyPayment * 50;
  const maxIterations = 1000;
  let iteration = 0;

  let homePrice = loanAmount + downPayment;
  let propertyTax = propertyTaxInput !== null ? propertyTaxInput / 12 : (0.01 * homePrice) / 12;
  let downPaymentPercentage = downPayment / homePrice;
  let pmi = downPaymentPercentage >= 0.2 ? 0 : (0.0046 * loanAmount) / 12;
  let totalPayment = 0;
  let monthlyMortgagePayment = 0;

  while (iteration < maxIterations) {
    iteration++;
    homePrice = loanAmount + downPayment;

    propertyTax = propertyTaxInput !== null
      ? propertyTaxInput / 12
      : (0.01 * homePrice) / 12;

    if (pmiInput !== null) {
      pmi = pmiInput / 12;
    } else {
      downPaymentPercentage = downPayment / homePrice;
      pmi = downPaymentPercentage >= 0.2 ? 0 : (0.0046 * loanAmount) / 12;
    }

    monthlyMortgagePayment = calculateMonthlyPrincipalAndInterest(loanAmount);
    totalPayment = monthlyMortgagePayment + propertyTax + pmi + hoaFees + monthlyHomeownersInsurance;

    const paymentDifference = desiredMonthlyPayment - totalPayment;
    const loanAdjustment = Math.max(paymentDifference / 10, 1000);

    if (paymentDifference < 0) break;
    loanAmount += loanAdjustment;
  }

  return {
    purchasePrice: +(loanAmount + downPayment).toFixed(2),
    loanAmount: +loanAmount.toFixed(2),
    downpayment: +downPayment.toFixed(2),
    totalPayment: +totalPayment.toFixed(2),
    mortgagePayment: +monthlyMortgagePayment.toFixed(2),
    propertyTax: +propertyTax.toFixed(2),
    pmi: +pmi.toFixed(2),
    homeownersInsurance: +monthlyHomeownersInsurance.toFixed(2),
    hoa: +hoaFees.toFixed(2),
  };
}

// Main calculator function that orchestrates all calculations
export function calculateAffordability(basicInputs: BasicInputType, advancedInputs: AdvancedInputType): CalculatorResults {
  const {
    householdIncome: householdIncomeStr,
    downPayment: downPaymentStr,
    monthlyDebt: monthlyDebtStr,
    annualInterestRate: annualInterestRateStr,
    loanTermYears: loanTermYearsStr,
    state,
    filingStatus,
  } = basicInputs;

  const {
    hoaFees: hoaFeesStr,
    homeownersInsurance: homeownersInsuranceStr,
    pmiInput,
    propertyTaxInput,
    pretaxContributions: pretaxContributionsStr,
    dependents: dependentsStr,
  } = advancedInputs;

  // Convert string inputs to numbers
  const householdIncome = Number(householdIncomeStr);
  const downPayment = Number(downPaymentStr);
  const monthlyDebt = Number(monthlyDebtStr);
  const annualInterestRate = Number(annualInterestRateStr);
  const loanTermYears = Number(loanTermYearsStr);
  const hoaFees = Number(hoaFeesStr);
  const homeownersInsurance = Number(homeownersInsuranceStr);
  const pretaxContributions = Number(pretaxContributionsStr);
  const dependents = Number(dependentsStr);

  // Step 1: Calculate net income
  const incomeSummary = calculateNetIncome(
    householdIncome,
    state,
    filingStatus,
    pretaxContributions,
    dependents
  );

  // Step 2: Check debt ratio
  const debtCheckResult = debtCheck(householdIncome, monthlyDebt);
  
  // Step 3: Calculate max mortgage payment
  const allowedDIR = debtCheckResult.below6 ? 0.28 : (0.36 - debtCheckResult.debtPercentage);
  const maxMonthlyMortgagePayment = calculateMaxMortgagePayment(householdIncome, allowedDIR);

  // Step 4: Calculate max purchase price
  const maxHomeStats = calculateLoanAmountFromMonthlyPayment({
    desiredMonthlyPayment: maxMonthlyMortgagePayment,
    downPayment,
    annualInterestRate,
    loanTermYears,
    hoaFees,
    homeownersInsurance,
    pmiInput,
    propertyTaxInput,
  });

  // Calculate saving scenarios (15%, 20%, 25%)
  const savingPercentages = [0.15, 0.20, 0.25];
  const savingScenarios: HomePrice[] = [];

  for (const savingsPercentage of savingPercentages) {
    const mortgagePayment = (incomeSummary.netIncome / 12) * (1 - savingsPercentage - 0.30 - 0.15);
    
    try {
      const mortgageStats = calculateLoanAmountFromMonthlyPayment({
        desiredMonthlyPayment: mortgagePayment,
        downPayment,
        annualInterestRate,
        loanTermYears,
        hoaFees,
        homeownersInsurance,
        pmiInput,
        propertyTaxInput,
      });

      savingScenarios.push({
        description: `${savingsPercentage * 100}% Saving Scenario`,
        mortgagePaymentStats: mortgageStats,
        scenario: {
          mortgage: {
            amount: mortgagePayment,
            percentage: mortgagePayment / (incomeSummary.netIncome / 12),
          },
          remainingNeeds: {
            amount: (incomeSummary.netIncome / 12) * 0.15,
            percentage: 0.15,
          },
          wants: {
            amount: (incomeSummary.netIncome / 12) * 0.30,
            percentage: 0.30,
          },
          savings: {
            amount: (incomeSummary.netIncome / 12) * savingsPercentage,
            percentage: savingsPercentage,
          },
        },
      });
    } catch (error) {
      console.error(`Failed to calculate scenario for ${savingsPercentage * 100}% savings:`, error);
    }
  }

  return {
    incomeSummary,
    maxHomePrice: {
      description: "Max Price The Bank Will Allow",
      mortgagePaymentStats: maxHomeStats,
      scenario: {
        mortgage: {
          amount: maxMonthlyMortgagePayment,
          percentage: maxMonthlyMortgagePayment / (incomeSummary.netIncome / 12),
        },
        remainingNeeds: {
          amount: (incomeSummary.netIncome / 12) * 0.15,
          percentage: 0.15,
        },
        wants: {
          amount: (incomeSummary.netIncome / 12) * 0.30,
          percentage: 0.30,
        },
        savings: {
          amount: (incomeSummary.netIncome / 12) * 0.15,
          percentage: 0.15,
        },
      },
    },
    savingScenarios,
    monthlyDebt,
  };
}
