
import React from 'react';

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">🏠 Buying a home?</h1>
        
        <p className="text-xl">Don't just guess what you can afford.</p>

        <p className="text-lg">
          We built a calculator that uses time-tested financial principles (shoutout to NerdWallet & MoneyUnder30) to help you stay stress-free. Here's how it works 🧵👇
        </p>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">1/ Financial principles built into the Calculator:</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">✅ 28/36 DTI Rule (Debt-to-Income Ratio):</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Front-end DTI = Mortgage payment shouldn't be more than 28% of gross income</li>
                <li>Back-end DTI = Total debt payments shouldn't be more than 36% of gross income</li>
              </ul>
              <p className="mt-2">DTI helps you measure how much of your income goes to debt. Lower is better—banks look at this to decide how much you can borrow.</p>
            </div>
            <div>
              <h3 className="font-semibold">✅ 50/30/20 budget:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>50% needs (housing, transportation, etc.)</li>
                <li>30% wants (fun stuff)</li>
                <li>20% savings + debt repayment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">✅ 3x income rule:</h3>
              <p>Keep your home price ≤ 3x your annual income</p>
            </div>
            <p>These principles help protect your finances and prevent buyer's remorse 🛟. Let's dive into the process 👇</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">2/ Step 1: We analyze your DTI.</h3>
            <p className="text-muted-foreground">Lenders typically allow a max mortgage payment of 28% of your gross income. If your back-end DTI (total debt) exceeds 8% beyond that (36% total), we lower your max mortgage payment to stay within safe limits.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">3/ Step 2: We calculate your max monthly mortgage payment based on the 28/36:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Max 28% of your gross income for mortgage 🏡</li>
              <li>Max 36% for total debt 💳</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">4/ Step 3: We calculate how much you can borrow based on that payment.</h3>
            <p>We factor in:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Down payment</li>
              <li>Interest rate</li>
              <li>Loan term</li>
              <li>Property taxes, PMI, HOA fees, and insurance</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">5/ Step 4: We calculate your net income.</h3>
            <p>Gross income isn't spendable income. After taxes, Social Security, and Medicare, your real take-home pay might be much lower 💵 and is what's used for the 50/30/20 budget rule.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">6/ Step 5: We check if your mortgage fits the 50/30/20 rule:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>50% needs (housing, transportation, insurance)</li>
              <li>30% wants (entertainment, hobbies)</li>
              <li>20% savings & extra debt payments 💰</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">7/ Steps 6-7: We also run multiple budget scenarios with different savings rates of 15% and 25% in addition to the standard 20%.</h3>
            <p>This helps you see how different home prices affect your ability to save and stay flexible.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">8/ Step 8: We calculate full housing costs for each scenario:</h3>
            <p>Mortgage + property taxes + insurance + HOA fees + PMI (if needed).</p>
            <p>You get a realistic breakdown of what's affordable—and what's risky 🏘️.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">9/ Step 9: We bring it all together:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Max home price banks might approve 🏦</li>
              <li>Comfortable home prices for your budget 💰</li>
              <li>Payment breakdowns & tax implications 📊</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">🔑 Key takeaway:</h2>
          <p>Banks approve based on their risk assessment. We focus on your financial health. This calculator shows what you can comfortably afford without sacrificing your savings.</p>
          <p>Avoid regret. Sleep better. Enjoy your new home. 😴🏡</p>
        </div>
      </div>
    </div>
  );
}
