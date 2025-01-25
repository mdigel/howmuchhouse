
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
    </div>
  );
}
