import { Router } from 'express';
import { incomes, states, generatePageContent } from './config';
import { getLayout } from './layout';

const router = Router();

// Main affordability index page
router.get('/affordability-by-income-level', (req, res) => {
  const content = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <a href="/" class="text-gray-700 hover:text-blue-600 text-sm">
              Home
            </a>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span class="text-gray-500 text-sm">Income Levels</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Main Content -->
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-8">Home Affordability by Income Level</h1>
          <p class="text-lg text-gray-600 mb-8">
            Select your income level to see how much house you can afford in different states:
          </p>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            ${incomes.map(income => `
              <div class="bg-gray-50 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-blue-50">
                <div class="p-6">
                  <h2 class="text-xl font-semibold text-gray-900 mb-4">${income} Salary Range</h2>
                  <div class="grid grid-cols-2 gap-2">
                    ${states.map(state => `
                      <a 
                        href="/${income}/${state.id}"
                        class="text-blue-600 hover:text-blue-800 hover:underline text-sm truncate"
                      >
                        ${state.name}
                      </a>
                    `).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
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
router.get('/:income/:state', async (req, res) => {
  const { income, state } = req.params;

  // Validate income and state
  if (!incomes.includes(income) || !states.find(s => s.id === state)) {
    return res.status(404).send('Page not found');
  }

  const pageContent = await generatePageContent(income, state);

  const content = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <a href="/" class="text-gray-700 hover:text-blue-600 text-sm">
              Home
            </a>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
              </svg>
              <a href="/affordability-by-income-level" class="text-gray-700 hover:text-blue-600 text-sm">
                Income Levels
              </a>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span class="text-gray-500 text-sm">${pageContent.title}</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Main Content -->
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-6">${pageContent.title}</h1>
          <div class="prose prose-lg text-gray-600">
            <p class="mb-6">${pageContent.description}</p>
            <div class="mt-8">
              <a 
                href="/affordability-by-income-level"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
              >
                View All Income Levels
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const html = getLayout(pageContent.title, pageContent.metaDescription, content);

  res.send(html);
});

export default router;