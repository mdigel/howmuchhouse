export const incomes = [
  "30k", "50k", "70k", "90k", "110k",
  "130k", "150k", "170k", "190k",
  "210k", "250k", "300k", "400k"
];

export const states = [
  { id: "alabama", name: "Alabama" },
  { id: "alaska", name: "Alaska" },
  { id: "arizona", name: "Arizona" },
  { id: "arkansas", name: "Arkansas" },
  { id: "california", name: "California" },
  // ... adding first few states for initial testing
];

export interface PageContent {
  title: string;
  description: string;
  metaDescription: string;
}

export function generatePageContent(income: string, state: string): PageContent {
  const stateName = states.find(s => s.id === state.toLowerCase())?.name || state;
  const title = `How Much House Can I Afford on a ${income} Salary in ${stateName}?`;
  const description = `Discover the home price range you can afford with a ${income} annual salary in ${stateName}. Get detailed insights into your buying power based on local market conditions, taxes, and living costs.`;
  const metaDescription = `Calculate your home buying power with a ${income} salary in ${stateName}. Get personalized insights on affordable house prices, monthly payments, and local market factors.`;

  return { title, description, metaDescription };
}
