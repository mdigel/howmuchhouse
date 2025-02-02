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
  let num = incomeStr.startsWith("+") ? incomeStr.slice(1) : incomeStr;
  return parseInt(num.replace("k", "")) * 1000;
}

function getAffordabilityData(incomeStr: string) {
  const incomeNum = parseIncome(incomeStr);
  return {
    minAffordPrice: incomeNum * 3,
    maxAffordPrice: incomeNum * 4,
    referenceHomePrice: incomeNum * 3,
  };
}

function computeAnnualTax(referenceHomePrice: number, taxRate: number): number {
  return Math.round(referenceHomePrice * (taxRate / 100));
}

export function generateDescription(
  stateName: string,
  incomeStr: string,
): string {
  // Ensure first letter is capitalized for state data lookup
  const formattedStateName =
    stateName.charAt(0).toUpperCase() + stateName.slice(1).toLowerCase();
  const state = stateData[formattedStateName];
  if (!state) {
    return `With a ${incomeStr} income, you're exploring home ownership opportunities in ${stateName}. Consider factors like local market conditions, property taxes, and cost of living when determining your ideal home budget.`;
  }

  const affordability = getAffordabilityData(incomeStr);
  const annualTax = computeAnnualTax(
    state.medianPriceMajorCity,
    state.propertyTaxRate,
  );

  // Case 1: medianPriceMajorCity is below the minimum affordability threshold
  if (state.medianPriceMajorCity < affordability.minAffordPrice) {
    const paragraph1 = `With a ${incomeStr} income, you're well-positioned to purchase a home in ${stateName}. Financial advisors recommend spending about 3 to 4 times your annual income on a home, suggesting a budget between $${affordability.minAffordPrice.toLocaleString()} and $${affordability.maxAffordPrice.toLocaleString()}, depending on factors like your down payment and existing debts.`;

    const paragraph2 = `In ${state.majorCity}, the median home price is approximately $${state.medianPriceMajorCity.toLocaleString()}, which is below your minimum affordability range. This situation opens up a broad selection of homes, potentially allowing you to consider higher-end properties or homes in better neighborhoods.`;

    const paragraph3 = `Other areas such as ${state.otherCities.join(" and ")} offer competitive pricing at ${state.medianPriceOtherCities}. ${stateName}'s property tax rate averages ${state.propertyTaxRate}%, adding roughly $${annualTax.toLocaleString()} annually on an average home. Coupled with ${state.costOfLivingDifference}, your income provides ample opportunities for homeownership.`;

    return paragraph1 + "\n\n" + paragraph2 + "\n\n" + paragraph3;

    // Case 2: medianPriceMajorCity is within or equal to the affordability range
  } else if (
    state.medianPriceMajorCity >= affordability.minAffordPrice &&
    state.medianPriceMajorCity <= affordability.maxAffordPrice
  ) {
    const paragraph1 = `With a ${incomeStr} income, you're right on target for purchasing a home in ${stateName}. Financial advisors recommend spending about 3 to 4 times your annual income on a home, which translates to a budget between $${affordability.minAffordPrice.toLocaleString()} and $${affordability.maxAffordPrice.toLocaleString()}.`;

    const paragraph2 = `In ${state.majorCity}, the median home price is approximately $${state.medianPriceMajorCity.toLocaleString()}, fitting neatly within your target range. This balance ensures a wide variety of quality homes are available to you.`;

    const paragraph3 = `Additionally, other cities like ${state.otherCities.join(" and ")} offer appealing options at ${state.medianPriceOtherCities}. With a property tax rate of ${state.propertyTaxRate}%—amounting to roughly $${annualTax.toLocaleString()} per year—and ${state.costOfLivingDifference}, your income comfortably supports homeownership across the state.`;

    return paragraph1 + "\n\n" + paragraph2 + "\n\n" + paragraph3;

    // Case 3: medianPriceMajorCity is above the maximum affordability threshold
  } else {
    const paragraph1 = `With a ${incomeStr} income, homeownership in ${stateName} might be more challenging, especially in ${state.majorCity}. Financial advisors recommend spending about 3 to 4 times your annual income on a home, setting your budget between $${affordability.minAffordPrice.toLocaleString()} and $${affordability.maxAffordPrice.toLocaleString()}.`;

    const paragraph2 = `However, the median home price in ${state.majorCity} is approximately $${state.medianPriceMajorCity.toLocaleString()}, which exceeds your maximum affordability range. This suggests that the major market may be less accessible at your current income level.`;

    const paragraph3 = `That said, more affordable options may be found in other areas such as ${state.otherCities.join(" and ")}, where prices average ${state.medianPriceOtherCities}. ${stateName} has a property tax rate of ${state.propertyTaxRate}%, or roughly $${annualTax.toLocaleString()} per year on an average home. Considering ${state.costOfLivingDifference}, you might need to explore alternative locations or financing strategies to meet your homeownership goals.`;

    return paragraph1 + "\n\n" + paragraph2 + "\n\n" + paragraph3;
  }
}

// State data
export const stateData: { [key: string]: StateData } = {
  Alabama: {
    majorCity: "Birmingham",
    medianPriceMajorCity: 220000,
    otherCities: ["Montgomery", "Mobile"],
    medianPriceOtherCities: "around $180,000",
    propertyTaxRate: 0.42,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Alaska: {
    majorCity: "Anchorage",
    medianPriceMajorCity: 410000,
    otherCities: ["Fairbanks", "Juneau"],
    medianPriceOtherCities: "around $330,000",
    propertyTaxRate: 1.1,
    costOfLivingDifference:
      "a cost of living significantly above the national average",
  },
  Arizona: {
    majorCity: "Phoenix",
    medianPriceMajorCity: 480000,
    otherCities: ["Tucson", "Mesa"],
    medianPriceOtherCities: "around $420,000",
    propertyTaxRate: 0.75,
    costOfLivingDifference:
      "a cost of living slightly below the national average",
  },
  Arkansas: {
    majorCity: "Little Rock",
    medianPriceMajorCity: 225000,
    otherCities: ["Fayetteville", "Hot Springs"],
    medianPriceOtherCities: "around $200,000",
    propertyTaxRate: 0.65,
    costOfLivingDifference: "a cost of living below the national average",
  },
  California: {
    majorCity: "Los Angeles",
    medianPriceMajorCity: 950000,
    otherCities: ["San Diego", "Sacramento"],
    medianPriceOtherCities: "ranging from $600,000 to $850,000",
    propertyTaxRate: 0.76,
    costOfLivingDifference:
      "a cost of living significantly above the national average",
  },
  Colorado: {
    majorCity: "Denver",
    medianPriceMajorCity: 800000,
    otherCities: ["Colorado Springs", "Aurora"],
    medianPriceOtherCities: "around $500,000",
    propertyTaxRate: 0.57,
    costOfLivingDifference: "a cost of living above the national average",
  },
  Connecticut: {
    majorCity: "Hartford",
    medianPriceMajorCity: 350000,
    otherCities: ["New Haven", "Stamford"],
    medianPriceOtherCities: "around $400,000",
    propertyTaxRate: 2.2,
    costOfLivingDifference:
      "a cost of living significantly above the national average",
  },
  Delaware: {
    majorCity: "Wilmington",
    medianPriceMajorCity: 320000,
    otherCities: ["Dover", "Newark"],
    medianPriceOtherCities: "around $270,000",
    propertyTaxRate: 0.57,
    costOfLivingDifference: "a cost of living near the national average",
  },
  Florida: {
    majorCity: "Miami",
    medianPriceMajorCity: 550000,
    otherCities: ["Tampa", "Orlando"],
    medianPriceOtherCities: "around $450,000",
    propertyTaxRate: 0.85,
    costOfLivingDifference: "a cost of living close to the national average",
  },
  Georgia: {
    majorCity: "Atlanta",
    medianPriceMajorCity: 450000,
    otherCities: ["Savannah", "Augusta"],
    medianPriceOtherCities: "around $300,000",
    propertyTaxRate: 1.05,
    costOfLivingDifference:
      "a cost of living slightly below the national average",
  },
  Hawaii: {
    majorCity: "Honolulu",
    medianPriceMajorCity: 1200000,
    otherCities: ["Hilo", "Kailua"],
    medianPriceOtherCities: "around $750,000",
    propertyTaxRate: 0.32,
    costOfLivingDifference:
      "a cost of living significantly above the national average",
  },
  Idaho: {
    majorCity: "Boise",
    medianPriceMajorCity: 700000,
    otherCities: ["Meridian", "Nampa"],
    medianPriceOtherCities: "around $500,000",
    propertyTaxRate: 0.72,
    costOfLivingDifference: "a cost of living near the national average",
  },
  Illinois: {
    majorCity: "Chicago",
    medianPriceMajorCity: 400000,
    otherCities: ["Aurora", "Naperville"],
    medianPriceOtherCities: "around $350,000",
    propertyTaxRate: 2.35,
    costOfLivingDifference: "a cost of living near the national average",
  },
  Indiana: {
    majorCity: "Indianapolis",
    medianPriceMajorCity: 230000,
    otherCities: ["Fort Wayne", "Evansville"],
    medianPriceOtherCities: "around $170,000",
    propertyTaxRate: 0.9,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Iowa: {
    majorCity: "Des Moines",
    medianPriceMajorCity: 240000,
    otherCities: ["Cedar Rapids", "Davenport"],
    medianPriceOtherCities: "around $210,000",
    propertyTaxRate: 1.25,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Kansas: {
    majorCity: "Wichita",
    medianPriceMajorCity: 200000,
    otherCities: ["Overland Park", "Topeka"],
    medianPriceOtherCities: "around $180,000",
    propertyTaxRate: 1.35,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Kentucky: {
    majorCity: "Louisville",
    medianPriceMajorCity: 220000,
    otherCities: ["Lexington", "Bowling Green"],
    medianPriceOtherCities: "around $200,000",
    propertyTaxRate: 0.85,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Louisiana: {
    majorCity: "New Orleans",
    medianPriceMajorCity: 320000,
    otherCities: ["Baton Rouge", "Lafayette"],
    medianPriceOtherCities: "around $250,000",
    propertyTaxRate: 0.57,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Maine: {
    majorCity: "Portland",
    medianPriceMajorCity: 380000,
    otherCities: ["Bangor", "Augusta"],
    medianPriceOtherCities: "around $320,000",
    propertyTaxRate: 1.1,
    costOfLivingDifference: "a cost of living near the national average",
  },
  Maryland: {
    majorCity: "Baltimore",
    medianPriceMajorCity: 420000,
    otherCities: ["Rockville", "Frederick"],
    medianPriceOtherCities: "around $450,000",
    propertyTaxRate: 1.15,
    costOfLivingDifference: "a cost of living above the national average",
  },
  Massachusetts: {
    majorCity: "Boston",
    medianPriceMajorCity: 900000,
    otherCities: ["Worcester", "Cambridge"],
    medianPriceOtherCities: "around $700,000",
    propertyTaxRate: 1.25,
    costOfLivingDifference:
      "a cost of living significantly above the national average",
  },
  Michigan: {
    majorCity: "Detroit",
    medianPriceMajorCity: 180000,
    otherCities: ["Grand Rapids", "Ann Arbor"],
    medianPriceOtherCities: "around $250,000",
    propertyTaxRate: 1.65,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Minnesota: {
    majorCity: "Minneapolis",
    medianPriceMajorCity: 350000,
    otherCities: ["St. Paul", "Rochester"],
    medianPriceOtherCities: "around $300,000",
    propertyTaxRate: 1.15,
    costOfLivingDifference: "a cost of living near the national average",
  },
  Mississippi: {
    majorCity: "Jackson",
    medianPriceMajorCity: 175000,
    otherCities: ["Gulfport", "Hattiesburg"],
    medianPriceOtherCities: "around $165,000",
    propertyTaxRate: 0.83,
    costOfLivingDifference:
      "a cost of living significantly below the national average",
  },
  Missouri: {
    majorCity: "Kansas City",
    medianPriceMajorCity: 250000,
    otherCities: ["St. Louis", "Springfield"],
    medianPriceOtherCities: "around $210,000",
    propertyTaxRate: 1.05,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Montana: {
    majorCity: "Billings",
    medianPriceMajorCity: 380000,
    otherCities: ["Missoula", "Great Falls"],
    medianPriceOtherCities: "around $330,000",
    propertyTaxRate: 0.92,
    costOfLivingDifference: "a cost of living near the national average",
  },
  Nebraska: {
    majorCity: "Omaha",
    medianPriceMajorCity: 280000,
    otherCities: ["Lincoln", "Kearney"],
    medianPriceOtherCities: "around $250,000",
    propertyTaxRate: 1.8,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Nevada: {
    majorCity: "Las Vegas",
    medianPriceMajorCity: 450000,
    otherCities: ["Reno", "Henderson"],
    medianPriceOtherCities: "around $400,000",
    propertyTaxRate: 0.7,
    costOfLivingDifference: "a cost of living near the national average",
  },
  "New Hampshire": {
    majorCity: "Manchester",
    medianPriceMajorCity: 380000,
    otherCities: ["Nashua", "Concord"],
    medianPriceOtherCities: "around $350,000",
    propertyTaxRate: 2.1,
    costOfLivingDifference:
      "a cost of living slightly above the national average",
  },
  "New Jersey": {
    majorCity: "Newark",
    medianPriceMajorCity: 500000,
    otherCities: ["Jersey City", "Trenton"],
    medianPriceOtherCities: "around $450,000",
    propertyTaxRate: 2.5,
    costOfLivingDifference:
      "a cost of living significantly above the national average",
  },
  "New Mexico": {
    majorCity: "Albuquerque",
    medianPriceMajorCity: 310000,
    otherCities: ["Santa Fe", "Las Cruces"],
    medianPriceOtherCities: "around $270,000",
    propertyTaxRate: 0.72,
    costOfLivingDifference: "a cost of living below the national average",
  },
  "New York": {
    majorCity: "New York City",
    medianPriceMajorCity: 1200000,
    otherCities: ["Buffalo", "Rochester"],
    medianPriceOtherCities: "around $300,000",
    propertyTaxRate: 1.7,
    costOfLivingDifference:
      "a cost of living significantly above the national average",
  },
  "North Carolina": {
    majorCity: "Charlotte",
    medianPriceMajorCity: 450000,
    otherCities: ["Raleigh", "Durham"],
    medianPriceOtherCities: "around $350,000",
    propertyTaxRate: 0.88,
    costOfLivingDifference:
      "a cost of living slightly below the national average",
  },
  "North Dakota": {
    majorCity: "Fargo",
    medianPriceMajorCity: 280000,
    otherCities: ["Bismarck", "Grand Forks"],
    medianPriceOtherCities: "around $240,000",
    propertyTaxRate: 1.05,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Ohio: {
    majorCity: "Columbus",
    medianPriceMajorCity: 350000,
    otherCities: ["Cleveland", "Dayton"],
    medianPriceOtherCities: "around $250,000",
    propertyTaxRate: 1.45,
    costOfLivingDifference:
      "a cost of living significantly below the national average",
  },
  Oklahoma: {
    majorCity: "Oklahoma City",
    medianPriceMajorCity: 230000,
    otherCities: ["Tulsa", "Norman"],
    medianPriceOtherCities: "around $210,000",
    propertyTaxRate: 0.93,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Oregon: {
    majorCity: "Portland",
    medianPriceMajorCity: 600000,
    otherCities: ["Salem", "Eugene"],
    medianPriceOtherCities: "around $520,000",
    propertyTaxRate: 1.12,
    costOfLivingDifference: "a cost of living above the national average",
  },
  Pennsylvania: {
    majorCity: "Philadelphia",
    medianPriceMajorCity: 280000,
    otherCities: ["Pittsburgh", "Allentown"],
    medianPriceOtherCities: "around $230,000",
    propertyTaxRate: 1.5,
    costOfLivingDifference: "a cost of living near the national average",
  },
  "Rhode Island": {
    majorCity: "Providence",
    medianPriceMajorCity: 450000,
    otherCities: ["Warwick", "Cranston"],
    medianPriceOtherCities: "around $400,000",
    propertyTaxRate: 1.65,
    costOfLivingDifference: "a cost of living near the national average",
  },
  "South Carolina": {
    majorCity: "Columbia",
    medianPriceMajorCity: 280000,
    otherCities: ["Charleston", "Greenville"],
    medianPriceOtherCities: "around $320,000",
    propertyTaxRate: 0.59,
    costOfLivingDifference: "a cost of living below the national average",
  },
  "South Dakota": {
    majorCity: "Sioux Falls",
    medianPriceMajorCity: 260000,
    otherCities: ["Rapid City", "Aberdeen"],
    medianPriceOtherCities: "around $230,000",
    propertyTaxRate: 1.32,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Tennessee: {
    majorCity: "Nashville",
    medianPriceMajorCity: 450000,
    otherCities: ["Memphis", "Knoxville"],
    medianPriceOtherCities: "around $300,000",
    propertyTaxRate: 0.66,
    costOfLivingDifference: "a cost of living below the national average",
  },
  Texas: {
    majorCity: "Houston",
    medianPriceMajorCity: 350000,
    otherCities: ["San Antonio", "Dallas"],
    medianPriceOtherCities: "around $330,000",
    propertyTaxRate: 1.85,
    costOfLivingDifference:
      "a cost of living slightly below the national average",
  },
  Utah: {
    majorCity: "Salt Lake City",
    medianPriceMajorCity: 550000,
    otherCities: ["Provo", "Ogden"],
    medianPriceOtherCities: "around $480,000",
    propertyTaxRate: 0.72,
    costOfLivingDifference: "a cost of living near the national average",
  },
  Vermont: {
    majorCity: "Burlington",
    medianPriceMajorCity: 380000,
    otherCities: ["Montpelier", "Rutland"],
    medianPriceOtherCities: "around $330,000",
    propertyTaxRate: 1.95,
    costOfLivingDifference: "a cost of living above the national average",
  },
  Virginia: {
    majorCity: "Virginia Beach",
    medianPriceMajorCity: 450000,
    otherCities: ["Richmond", "Arlington"],
    medianPriceOtherCities: "around $500,000",
    propertyTaxRate: 0.82,
    costOfLivingDifference: "a cost of living near the national average",
  },
  Washington: {
    majorCity: "Seattle",
    medianPriceMajorCity: 900000,
    otherCities: ["Spokane", "Tacoma"],
    medianPriceOtherCities: "around $500,000",
    propertyTaxRate: 1.05,
    costOfLivingDifference: "a cost of living above the national average",
  },
  "West Virginia": {
    majorCity: "Charleston",
    medianPriceMajorCity: 160000,
    otherCities: ["Morgantown", "Huntington"],
    medianPriceOtherCities: "around $140,000",
    propertyTaxRate: 0.6,
    costOfLivingDifference:
      "a cost of living significantly below the national average",
  },
  Wisconsin: {
    majorCity: "Milwaukee",
    medianPriceMajorCity: 250000,
    otherCities: ["Madison", "Green Bay"],
    medianPriceOtherCities: "around $230,000",
    propertyTaxRate: 1.8,
    costOfLivingDifference: "a cost of living near the national average",
  },
  Wyoming: {
    majorCity: "Cheyenne",
    medianPriceMajorCity: 320000,
    otherCities: ["Casper", "Laramie"],
    medianPriceOtherCities: "around $270,000",
    propertyTaxRate: 0.63,
    costOfLivingDifference: "a cost of living below the national average",
  },
};
