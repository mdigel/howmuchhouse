
import React from 'react';

export default function Feedback() {
  return (
    <div className="container mx-auto px-4 py-6 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="space-y-4">
        <a
          href="https://x.com/Elder_Deagle"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-col items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-base">ideas, feedback, bugs</span>
        </a>
        
      </div>
    </div>
  );
}
