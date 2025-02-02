export function getLayout(title: string, metaDescription: string, content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta name="description" content="${metaDescription}">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', sans-serif;
          }
        </style>
      </head>
      <body class="bg-gray-50">
        <nav class="bg-white border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex">
                <a href="/" class="flex items-center">
                  <span class="text-xl font-bold text-gray-900">HouseAfford.ai</span>
                </a>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/" 
                   class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700">
                   Calculator
                </a>
                <a href="/how-it-works"
                   class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700">
                   How it works
                </a>
                <a href="/feedback"
                   class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700">
                   Feedback
                </a>
                <a href="/affordability-by-income-level"
                   class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700">
                   Affordability By Income
                </a>
              </div>
              <!-- Mobile menu button -->
              <div class="flex items-center sm:hidden">
                <button type="button" 
                        class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        aria-controls="mobile-menu"
                        aria-expanded="false">
                  <span class="sr-only">Open main menu</span>
                  <!-- Menu icon -->
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile menu -->
          <div class="sm:hidden" id="mobile-menu">
            <div class="pt-2 pb-3 space-y-1">
              <a href="/" 
                 class="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                 Calculator
              </a>
              <a href="/how-it-works"
                 class="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                 How it works
              </a>
              <a href="/feedback"
                 class="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                 Feedback
              </a>
              <a href="/affordability-by-income-level"
                 class="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                 Affordability By Income
              </a>
            </div>
          </div>
        </nav>
        <main class="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
          ${content}
        </main>
        <footer class="bg-white mt-12 border-t border-gray-200">
          <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <p class="text-center text-gray-500 text-sm">
              © ${new Date().getFullYear()} HouseAfford.ai. All rights reserved.
            </p>
          </div>
        </footer>
        <script>
          // Mobile menu toggle
          document.querySelector('button[aria-controls="mobile-menu"]').addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
          });
        </script>
      </body>
    </html>
  `;
}