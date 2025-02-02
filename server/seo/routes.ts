import { Router } from 'express';
import { incomes, states, generatePageContent } from './config';
import { getLayout } from './layout';

const router = Router();

// Main affordability index page - now with interactive components
router.get('/affordability-by-income-level', (req, res) => {
  const content = `
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  `;

  const html = getLayout(
    'Interactive Home Affordability Calculator | Find Your Perfect Price Range',
    'Explore home affordability across different states with our interactive calculator. Use the slider to set your income and click on any state to see detailed insights.',
    content
  );

  res.send(html);
});

// Keep existing dynamic income/state pages route
router.get('/:income/:state', (req, res) => {
  const { income, state } = req.params;

  // Validate income and state
  if (!incomes.includes(income) || !states.find(s => s.id === state)) {
    return res.status(404).send('Page not found');
  }

  const pageContent = generatePageContent(income, state);

  const content = `
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  `;

  const html = getLayout(pageContent.title, pageContent.metaDescription, content);

  res.send(html);
});

export default router;