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
        <nav class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex">
                <a href="/" class="flex items-center">
                  <span class="text-xl font-bold text-gray-900">HouseAfford.ai</span>
                </a>
              </div>
              <div class="flex items-center">
                <a href="/affordability-by-income-level" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Affordability Guide
                </a>
                <a href="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Calculator
                </a>
              </div>
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
      </body>
    </html>
  `;
}
