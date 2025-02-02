export const incomes = [
  "70k", "90k", "110k", "130k", "150k", "170k", "190k",
  "210k", "250k", "300k", "350k", "400k", "450k", "+500k"
];

export const states = [
  { id: "alabama", name: "Alabama" },
  { id: "alaska", name: "Alaska" },
  { id: "arizona", name: "Arizona" },
  { id: "arkansas", name: "Arkansas" },
  { id: "california", name: "California" },
  { id: "colorado", name: "Colorado" },
  { id: "connecticut", name: "Connecticut" },
  { id: "delaware", name: "Delaware" },
  { id: "florida", name: "Florida" },
  { id: "georgia", name: "Georgia" },
  { id: "hawaii", name: "Hawaii" },
  { id: "idaho", name: "Idaho" },
  { id: "illinois", name: "Illinois" },
  { id: "indiana", name: "Indiana" },
  { id: "iowa", name: "Iowa" },
  { id: "kansas", name: "Kansas" },
  { id: "kentucky", name: "Kentucky" },
  { id: "louisiana", name: "Louisiana" },
  { id: "maine", name: "Maine" },
  { id: "maryland", name: "Maryland" },
  { id: "massachusetts", name: "Massachusetts" },
  { id: "michigan", name: "Michigan" },
  { id: "minnesota", name: "Minnesota" },
  { id: "mississippi", name: "Mississippi" },
  { id: "missouri", name: "Missouri" },
  { id: "montana", name: "Montana" },
  { id: "nebraska", name: "Nebraska" },
  { id: "nevada", name: "Nevada" },
  { id: "new-hampshire", name: "New Hampshire" },
  { id: "new-jersey", name: "New Jersey" },
  { id: "new-mexico", name: "New Mexico" },
  { id: "new-york", name: "New York" },
  { id: "north-carolina", name: "North Carolina" },
  { id: "north-dakota", name: "North Dakota" },
  { id: "ohio", name: "Ohio" },
  { id: "oklahoma", name: "Oklahoma" },
  { id: "oregon", name: "Oregon" },
  { id: "pennsylvania", name: "Pennsylvania" },
  { id: "rhode-island", name: "Rhode Island" },
  { id: "south-carolina", name: "South Carolina" },
  { id: "south-dakota", name: "South Dakota" },
  { id: "tennessee", name: "Tennessee" },
  { id: "texas", name: "Texas" },
  { id: "utah", name: "Utah" },
  { id: "vermont", name: "Vermont" },
  { id: "virginia", name: "Virginia" },
  { id: "washington", name: "Washington" },
  { id: "west-virginia", name: "West Virginia" },
  { id: "wisconsin", name: "Wisconsin" },
  { id: "wyoming", name: "Wyoming" }
];

export interface PageContent {
  title: string;
  description: string;
  metaDescription: string;
}

import { descriptions } from './descriptions';

export function generatePageContent(income: string, state: string): PageContent {
  const stateName = states.find(s => s.id === state.toLowerCase())?.name || state;
  const title = `How Much ${
    '<span className="relative inline-block">House<span className="absolute inset-0 bg-[#006AFF]/20 -rotate-1"></span></span>'
  } Can I Afford on a ${
    '<span class="relative inline-block">' + income + ' Income<span class="absolute inset-0 bg-[#006AFF]/20 -rotate-1"></span></span>'
  } in ${
    '<span class="relative inline-block">' + stateName + '<span class="absolute inset-0 bg-[#006AFF]/20 rotate-1"></span></span>'
  }?`;

  // Get description from CSV mapping
  const description = descriptions[state.toLowerCase()]?.[income] || 
    `Discover the home price range you can afford with a ${income} annual salary in ${stateName}. Get detailed insights into your buying power based on local market conditions, taxes, and living costs.`;

  const metaDescription = `Calculate your home buying power with a ${income} salary in ${stateName}. Get personalized insights on affordable house prices, monthly payments, and local market factors.`;

  return { title, description, metaDescription };
}