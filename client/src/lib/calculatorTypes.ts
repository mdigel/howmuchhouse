export interface BasicInputType {
  householdIncome: number;
  downPayment: number;
  annualInterestRate: number;
  loanTermYears: number;
  state: string;
  filingStatus: string;
}

export interface AdvancedInputType {
  hoaFees: string;
  homeownersInsurance: string;
  pmiInput: number | null;
  propertyTaxInput: number | null;
  pretaxContributions: string;
  dependents: string;
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

export interface ScenarioBreakdown {
  mortgagePayment: number;
  mortgagePercentage: number;
}

export interface Scenario {
  monthlyNetIncome?: number;
  mortgage: ScenarioBreakdown;
  wants: ScenarioBreakdown;
  remainingNeeds: ScenarioBreakdown;
  savings: ScenarioBreakdown;
}

export interface HomePrice {
  description: string;
  mortgagePaymentStats: MortgagePaymentStats;
  scenario: Scenario;
}

export interface CalculatorResults {
  incomeSummary: IncomeSummary;
  maxHomePrice: HomePrice;
  savingScenarios: HomePrice[];
}
