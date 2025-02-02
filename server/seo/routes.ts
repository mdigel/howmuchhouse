import { Router } from 'express';
import { incomes, states, generatePageContent } from './config';

const router = Router();

// Main affordability index page
router.get('/affordability-by-income-level', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Home Affordability Calculator by Income Level | Find Your Perfect Price Range</title>
        <meta name="description" content="Discover how much house you can afford based on your income level. Explore state-specific home buying guides for different salary ranges.">
      </head>
      <body>
        <h1>Home Affordability by Income Level</h1>
        <p>Select your income level to see how much house you can afford in different states:</p>
        <ul>
          ${incomes.map(income => `
            <li>
              <h2>${income} Salary Range</h2>
              <ul>
                ${states.map(state => `
                  <li>
                    <a href="/${income}/${state.id}">${state.name}</a>
                  </li>
                `).join('')}
              </ul>
            </li>
          `).join('')}
        </ul>
      </body>
    </html>
  `;
  
  res.send(html);
});

// Dynamic income/state pages
router.get('/:income/:state', (req, res) => {
  const { income, state } = req.params;
  
  // Validate income and state
  if (!incomes.includes(income) || !states.find(s => s.id === state)) {
    return res.status(404).send('Page not found');
  }
  
  const content = generatePageContent(income, state);
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.title}</title>
        <meta name="description" content="${content.metaDescription}">
      </head>
      <body>
        <h1>${content.title}</h1>
        <p>${content.description}</p>
        <p><a href="/affordability-by-income-level">View All Income Levels</a></p>
      </body>
    </html>
  `;
  
  res.send(html);
});

export default router;
