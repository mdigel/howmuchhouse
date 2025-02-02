import { Router } from 'express';
import { incomes, states, generatePageContent } from './config';
import { getLayout } from './layout';

const router = Router();

// Main affordability index page - redirect to the React app
router.get('/affordability-by-income-level', (_req, res) => {
  res.redirect('/');
});

// Dynamic income/state pages - redirect to the React app
router.get('/:income/:state', (req, res) => {
  const { income, state } = req.params;

  // Validate income and state
  if (!incomes.includes(income) || !states.find(s => s.id === state)) {
    return res.status(404).send('Page not found');
  }

  // Redirect to the React app with the parameters
  res.redirect(`/?income=${income}&state=${state}`);
});

export default router;