import React from 'react';

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">🏠 Buying a home?</h1>

        <p className="text-xl">Don't just guess what you can afford.</p>

        <p className="text-lg mb-8">
          We built a calculator that uses time-tested financial principles (shoutout to NerdWallet & MoneyUnder30) to help you stay stress-free. Here's how it works 🧵👇
        </p>

        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">1/ Financial principles built into the Calculator:</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">✅ 28/36 DTI Rule (Debt-to-Income Ratio):</h3>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Front-end DTI = Mortgage payment shouldn't be more than 28% of gross income</li>
                  <li>Back-end DTI = Total debt payments shouldn't be more than 36% of gross income</li>
                </ul>
                <p className="mt-2 text-muted-foreground">
                  DTI helps you measure how much of your income goes to debt. Lower is better—banks look at this to decide how much you can borrow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}