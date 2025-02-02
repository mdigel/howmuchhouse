
import { generateDescription } from './stateData';
import { states } from './config';

// Generate descriptions dynamically using state data
const descriptions: { [key: string]: { [key: string]: string } } = {};

// Initialize descriptions for all states and income levels
states.forEach(state => {
  descriptions[state.id] = {};
  ["70k", "90k", "110k", "130k", "150k", "170k", "190k",
   "210k", "250k", "300k", "350k", "400k", "450k", "+500k"].forEach(income => {
    descriptions[state.id][income] = generateDescription(state.name, income);
  });
});

export { descriptions };