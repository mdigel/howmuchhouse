
import { states, incomes } from './config';
import { generateDescription } from './stateData';

// Generate descriptions dynamically using state data
const descriptions: { [key: string]: { [key: string]: string } } = {};

// Initialize descriptions for all states and income levels
states.forEach(state => {
  descriptions[state.id] = {};
  incomes.forEach(income => {
    descriptions[state.id][income] = generateDescription(state.name, income);
  });
});

export { descriptions };
