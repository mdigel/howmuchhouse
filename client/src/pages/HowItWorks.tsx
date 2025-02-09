
import React from 'react';

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">🏠 Buying a home?</h1>
      <p className="text-xl mb-8">Don't just guess what you can afford.</p>
      <p className="text-lg mb-8">We built a calculator that uses time-tested financial principles (shoutout to NerdWallet & MoneyUnder30) to help you stay stress-free. Here's how it works 🧵👇</p>
      
      <h2 className="text-xl font-semibold mb-4">First, timeless financial principles built into the calculator:</h2>
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
          <h3 className="font-semibold">✅ 3-4x income rule:</h3>
          <p>Keep your home price less than 3-4x your annual income</p>
          <p className="mt-2">These principles help protect your finances and prevent buyer's remorse 🛟. Let's dive into the process 👇</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">1/ Step 1: We analyze your DTI.</h3>
          <p>Usually, lenders want your total debt-to-income ratio (back-end DIR) to stay under 36%. If your current debts already take up 8% or more of your gross income, we'll need to lower the max front-end DIR (housing expenses) from 28% to keep your total debt within that 36% limit.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">2/ Step 2: We calculate your max monthly mortgage payment based on the 28/36:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Max 28% of your gross income for mortgage 🏡</li>
            <li>Max 36% for total debt 💳</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">3/ Step 3: We calculate how much you can borrow based on that payment.</h3>
          <p>Now we know what you should pay each much for your house. Next we calculate the most expensive house you can afford with that constraint and these inputs:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Down payment</li>
            <li>Interest rate</li>
            <li>Loan term</li>
            <li>Property taxes, PMI, HOA fees, and insurance</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">4/ Step 4: We calculate your net income.</h3>
          <p>After taxes, Social Security, and Medicare, your real take-home is what's used for the 50/30/20 budget rule.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">5/ Step 5: We check if your mortgage fits the 50/30/20 rule:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>50% needs (housing, transportation, insurance)</li>
            <li>30% wants (entertainment, hobbies)</li>
            <li>20% savings & extra debt payments 💰</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">6/ Step 6: We check different budget scenarios.</h3>
          <p>Each scenario has a different savings rate (15% and 25%). This helps you see how different home prices affect your ability to save and stay financially flexible.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">7/ Step 7: We calculate the monthly mortgage payment for each scenario:</h3>
          <p>Mortgage + property taxes + insurance + HOA fees + PMI (if needed).</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">8/ Step 8: We bring it all together:</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Max home price under the 28/36 DIR Rule 🏦</li>
            <li>Comfortable home prices that allow for different rates of saving 💰</li>
            <li>Transaction, Budget and Mortgage breakdowns for each scenario 📊</li>
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">🔑 Key takeaway:</h3>
          <p>Banks issue approvals according to their risk assessment. We concentrate on your financial wellness and the ease with which you make mortgage payments. This calculator is set up to guide you in computing what you can pay without it pinching your lifestyle.</p>
          <p className="mt-2">Avoid regret. House hunt with confidence in your budget. 😴🏡</p>
        </div>
      </div>
    </div>
  );
}
