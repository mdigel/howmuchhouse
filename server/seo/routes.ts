import { Router } from 'express';
import { incomes, states, generatePageContent } from './config';
import { getLayout } from './layout';

const router = Router();

// Main affordability index page
router.get('/affordability-by-income-level', (req, res) => {
  const content = `
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Home Affordability by Income Level</h1>
        <p class="text-lg text-gray-600 mb-8">
          Select your income level to see how much house you can afford in different states:
        </p>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          ${incomes.map(income => `
            <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">${income} Salary Range</h2>
              <ul class="space-y-2">
                ${states.map(state => `
                  <li>
                    <a 
                      href="/${income}/${state.id}"
                      class="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      ${state.name}
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  const html = getLayout(
    'Home Affordability Calculator by Income Level | Find Your Perfect Price Range',
    'Discover how much house you can afford based on your income level. Explore state-specific home buying guides for different salary ranges.',
    content
  );

  res.send(html);
});

// Dynamic income/state pages
router.get('/:income/:state', (req, res) => {
  const { income, state } = req.params;

  // Validate income and state
  if (!incomes.includes(income) || !states.find(s => s.id === state)) {
    return res.status(404).send('Page not found');
  }

  const pageContent = generatePageContent(income, state);

  const content = `
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">${pageContent.title}</h1>
        <div class="prose prose-lg text-gray-600">
          <p class="mb-6">${pageContent.description}</p>
          <div class="mt-8">
            <a 
              href="/affordability-by-income-level"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Income Levels
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  const html = getLayout(pageContent.title, pageContent.metaDescription, content);

  res.send(html);
});

export default router;