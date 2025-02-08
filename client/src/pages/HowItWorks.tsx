
import React from 'react';

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">🏠 How It Works?</h1>
      <div className="space-y-8">
        <p className="text-xl">Don't just guess what you can afford. Our calculator uses time-tested financial principles to help you stay stress-free.</p>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Financial Principles Built Into the Calculator ✅</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">28/36 DTI Rule (Debt-to-Income Ratio):</h3>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Front-end DTI: Mortgage payment shouldn't be more than 28% of gross income</li>
                <li>Back-end DTI: Total debt payments shouldn't be more than 36% of gross income</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">50/30/20 Budget Rule:</h3>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>50% needs (housing, transportation, etc.)</li>
                <li>30% wants (fun stuff)</li>
                <li>20% savings + debt repayment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">3x Income Rule:</h3>
              <p className="text-muted-foreground">Keep your home price ≤ 3x your annual income</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">1️⃣ DTI Analysis</h3>
            <p className="text-muted-foreground">We analyze your debt-to-income ratio to ensure you stay within safe borrowing limits.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">2️⃣ Maximum Monthly Payment</h3>
            <p className="text-muted-foreground">We calculate your maximum monthly mortgage payment based on the 28/36 rule.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">3️⃣ Borrowing Power</h3>
            <p className="text-muted-foreground">We factor in down payment, interest rate, loan term, property taxes, PMI, HOA fees, and insurance.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">4️⃣ Net Income Calculation</h3>
            <p className="text-muted-foreground">We calculate your take-home pay after taxes and deductions for realistic budgeting.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">5️⃣ Budget Rule Check</h3>
            <p className="text-muted-foreground">We verify if your mortgage fits within the 50/30/20 budget rule.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">6️⃣-7️⃣ Multiple Scenarios</h3>
            <p className="text-muted-foreground">We run scenarios with different savings rates (15%, 20%, 25%) to show how home prices affect your financial flexibility.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">8️⃣ Full Cost Analysis</h3>
            <p className="text-muted-foreground">We break down all housing costs including mortgage, taxes, insurance, HOA fees, and PMI.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">9️⃣ Complete Picture</h3>
            <p className="text-muted-foreground">We show you both bank approval estimates and comfortable budget-based prices.</p>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold mb-2">🔑 Key Takeaway</h2>
          <p className="text-muted-foreground">While banks approve based on their risk assessment, we focus on your financial health. Our calculator helps you find a home price you can comfortably afford without sacrificing your savings goals.</p>
        </div>
      </div>
    </div>
  );
}
