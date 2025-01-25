
import React from 'react';

export default function Feedback() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>
      <div className="space-y-6">
        <p className="text-muted-foreground">
          We're constantly working to improve our calculator and would love to hear your thoughts. Your feedback helps us make the tool more useful for everyone.
        </p>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Coming soon: A form to submit your feedback about the calculator and AI assistant.
          </p>
        </div>
      </div>
      <footer className="mt-36 md:mt-48 pb-6 text-center space-y-4">
        <div className="w-full max-w-2xl mx-auto border-t border-border pt-6" />
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
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} A Plymouth Holding Production</p>
            <p className="text-xs">Talk to a human before making a huge financial decision.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
