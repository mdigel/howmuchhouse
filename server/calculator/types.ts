// Types for calculator inputs and outputs
export interface CalculatorInput {
  householdIncome: number;
  downPayment: number;
  monthlyDebt: number;
  annualInterestRate?: number;
  loanTermYears?: number;
  state?: string;
  filingStatus?: 'single' | 'married';
  hoaFees?: number;
  homeownersInsurance?: number;
  pmiInput?: number | null;
  propertyTaxInput?: number | null;
  pretaxContributions?: number;
  dependents?: number;
}

export interface IncomeSummary {
  grossIncome: number;
  adjustedGrossIncome: number;
  federalTax: number;
  stateTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  totalTax: number;
  childTaxCredit: number;
  netIncome: number;
}

export interface MortgagePaymentStats {
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

export interface BudgetScenario {
  mortgage: {
    mortgagePayment: number;
    mortgagePercentage: number;
  };
  debt: {
    amount: number;
    percentage: number;
  };
  remainingNeeds: {
    amount: number;
    percentage: number;
  };
  wants: {
    amount: number;
    percentage: number;
  };
  savings: {
    amount: number;
    percentage: number;
  };
}

export interface MaxMortgageStats {
  description: string;
  mortgagePaymentStats: MortgagePaymentStats;
  scenario: BudgetScenario;
}

export interface SavingScenario {
  description: string;
  mortgagePaymentStats: MortgagePaymentStats;
  scenario: BudgetScenario;
}

export interface CalculatorOutput {
  incomeSummary: IncomeSummary;
  debtCheck: {
    debCheckOutcome: boolean;
    debtCheckPercent: number;
  };
  maxMortgageStats: MaxMortgageStats;
  allSavingsScenarios: SavingScenario[];
}
