
import React from 'react';

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">How It Works?</h1>
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Our home affordability calculator uses advanced algorithms to help you understand how much house you can afford. Here's a quick overview of how it works:
        </p>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">1. Input Your Information</h2>
            <p className="text-muted-foreground">Enter basic details about your finances, including income, debts, and location.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">2. Advanced Calculations</h2>
            <p className="text-muted-foreground">Our calculator processes your information using industry-standard formulas and guidelines.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">3. AI-Powered Analysis</h2>
            <p className="text-muted-foreground">Get personalized insights and recommendations based on your specific situation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
