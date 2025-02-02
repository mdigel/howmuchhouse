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
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Noto Sans', sans-serif;
          }
        </style>
      </head>
      <body class="bg-gray-50">
        <header class="w-full py-6 border-b border-border relative">
          <div class="container mx-auto px-4 md:px-4 lg:px-4 max-w-[1200px]">
            <div class="flex justify-between items-center">
              <a href="/" class="text-left space-y-2 hover:opacity-80 transition-opacity">
                <div class="flex items-center gap-2">
                  <h1 class="text-lg md:text-[2rem] leading-tight md:leading-8 tracking-tight font-bold font-noto-sans">
                    How Much <span class="relative inline-block">
                      House
                      <span class="absolute inset-0 bg-[#006AFF]/20 -rotate-1"></span>
                    </span> Can I <span class="relative inline-block">
                      Afford.ai
                      <span class="absolute inset-0 bg-[#006AFF]/20 rotate-1"></span>
                    </span>
                  </h1>
                </div>
                <p class="text-muted-foreground text-xs md:text-base">An affordability calculator with an AI Assistant.</p>
              </a>

              <!-- Desktop Menu -->
              <nav class="hidden md:flex gap-6">
                <a href="/" 
                   class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                   Calculator
                </a>
                <a href="/how-it-works"
                   class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                   How It Works?
                </a>
                <a href="/feedback"
                   class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                   Feedback
                </a>
                <a href="/affordability-by-income-level"
                   class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                   Affordability By Income
                </a>
              </nav>

              <!-- Mobile Menu Button -->
              <button 
                class="md:hidden p-2 hover:bg-accent rounded-md"
                aria-label="Toggle menu"
                aria-expanded="false"
                aria-controls="mobile-menu"
              >
                <svg class="block h-6 w-6" id="hamburger-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg class="hidden h-6 w-6" id="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Mobile Menu -->
            <nav class="hidden md:hidden absolute left-0 right-0 top-full bg-background border-b border-border py-4 px-4 shadow-lg z-50" id="mobile-menu">
              <div class="flex flex-col space-y-4">
                <a href="/" 
                   class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                   Calculator
                </a>
                <a href="/how-it-works"
                   class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                   How It Works?
                </a>
                <a href="/feedback"
                   class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                   Feedback
                </a>
                <a href="/affordability-by-income-level"
                   class="text-sm font-medium transition-colors hover:text-primary text-muted-foreground">
                   Affordability By Income
                </a>
              </div>
            </nav>
          </div>
        </header>

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
          const hamburgerButton = document.querySelector('button[aria-controls="mobile-menu"]');
          const mobileMenu = document.getElementById('mobile-menu');
          const hamburgerIcon = document.getElementById('hamburger-icon');
          const closeIcon = document.getElementById('close-icon');

          hamburgerButton.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!isExpanded));
            mobileMenu.classList.toggle('hidden');
            hamburgerIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
          });
        </script>
      </body>
    </html>
  `;
}