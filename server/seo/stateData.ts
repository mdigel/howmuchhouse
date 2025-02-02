
export const stateData: { [key: string]: StateData } = {
  "Ohio": {
    majorCity: "Columbus",
    medianPriceMajorCity: 310000,
    otherCities: ["Cleveland", "Dayton"],
    medianPriceOtherCities: "around $225,000",
    propertyTaxRate: 1.41,
    costOfLivingDifference: "a cost of living 12% below the national average"
  },
  "Alabama": {
    majorCity: "Birmingham",
    medianPriceMajorCity: 289000,
    otherCities: ["Montgomery", "Mobile"],
    medianPriceOtherCities: "around $210,000",
    propertyTaxRate: 0.42,
    costOfLivingDifference: "a cost of living 13% below the national average"
  }
  // Add more states here...
};

export interface StateData {
  majorCity: string;
  medianPriceMajorCity: number;
  otherCities: string[];
  medianPriceOtherCities: string;
  propertyTaxRate: number;
  costOfLivingDifference: string;
}

// Helper functions
function parseIncome(incomeStr: string): number {
  let num = incomeStr.startsWith('+') ? incomeStr.slice(1) : incomeStr;
  return parseInt(num.replace('k', '')) * 1000;
}

function getAffordabilityData(incomeStr: string) {
  const incomeNum = parseIncome(incomeStr);
  return {
    minAffordPrice: incomeNum * 3,
    maxAffordPrice: incomeNum * 4,
    referenceHomePrice: incomeNum * 3
  };
}

function computeAnnualTax(referenceHomePrice: number, taxRate: number): number {
  return Math.round(referenceHomePrice * (taxRate / 100));
}

export function generateDescription(stateName: string, incomeStr: string): string {
  // Ensure first letter is capitalized for state data lookup
  const formattedStateName = stateName.charAt(0).toUpperCase() + stateName.slice(1).toLowerCase();
  const state = stateData[formattedStateName];
  if (!state) {
    return `With a ${incomeStr} income, you're exploring home ownership opportunities in ${stateName}. Consider factors like local market conditions, property taxes, and cost of living when determining your ideal home budget.`;
  }
  const affordability = getAffordabilityData(incomeStr);
  const annualTax = computeAnnualTax(state.medianPriceMajorCity, state.propertyTaxRate);

  return `With a ${incomeStr} income, you're well-positioned to afford a home in ${stateName}. ` +
    `Financial advisors often recommend spending about 3 to 4 times your annual income on a home, suggesting a ` +
    `budget between $${affordability.minAffordPrice.toLocaleString()} and $${affordability.maxAffordPrice.toLocaleString()}, ` +
    `depending on factors like your down payment and existing debts. In ${state.majorCity}, where the ` +
    `median home price is approximately $${state.medianPriceMajorCity.toLocaleString()}, you'll find a variety of ` +
    `options within your budget. Other cities like ${state.otherCities.join(' and ')} offer median home prices ` +
    `${state.medianPriceOtherCities}, providing even more affordable choices. ${stateName}'s property tax rate ` +
    `averages ${state.propertyTaxRate}%, potentially adding about $${annualTax.toLocaleString()} annually on a ` +
    `$${state.medianPriceMajorCity.toLocaleString()} home. Thanks to ${state.costOfLivingDifference}, your ` +
    `salary can support comfortable homeownership across much of the state.`;
}
