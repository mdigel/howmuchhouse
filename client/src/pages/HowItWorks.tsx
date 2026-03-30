import React from "react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4">
        We weren't going to buy a house for another 6 months.
      </h1>
      <p className="text-muted-foreground text-lg mb-10">
        But then we fell in love with a house and HAD to make an offer.
      </p>

      <div className="space-y-4 text-base leading-relaxed mb-12">
        <p>
          The next 3 days were some of the most stressful of my life. What can we
          actually afford? Am I signing us up to be stressed out for the next 10
          years? I hadn't done the analysis yet.
        </p>
        <p>
          I ended up relying a ton on AI for scenario planning. This calculator
          and AI assistant is what I wish I had then.
        </p>
        <p>
          We built this calculator using time-tested financial principles
          (shoutout to NerdWallet & MoneyUnder30) to help you stay stress-free.
        </p>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-black mb-6">
        Timeless financial principles
      </h2>

      <div className="bg-[#F3F3F3] rounded-lg p-6 md:p-8 space-y-6 mb-12">
        <div>
          <h3 className="font-bold text-black mb-2">28/36 DTI Rule (Debt-to-Income Ratio)</h3>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Front-end DTI = Mortgage payment should not exceed 28% of gross income</li>
            <li>Back-end DTI = Total debt payments should not exceed 36% of gross income</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            Banks use DTI to decide how much you can borrow.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-black mb-2">50/30/20 Budget</h3>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>50% needs (housing, transportation, minimum debt payments)</li>
            <li>30% wants (fun stuff)</li>
            <li>20% savings</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-black mb-2">3-4x Income Rule</h3>
          <p className="text-sm">Purchase a home for no more than 3-4x your annual income.</p>
          <p className="text-sm text-muted-foreground mt-2">
            These principles help protect your finances and prevent buyer's remorse.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-black mb-8">
        How the calculator works
      </h2>

      <div className="space-y-8 mb-16">
        {[
          {
            step: 1,
            title: "Analyze your DTI",
            content: "Usually, lenders want your total debt-to-income ratio (back-end DTI) to stay under 36%. If your current debts already take up 8% or more of your gross income, we'll need to lower the max front-end DTI (housing expenses) from 28% to keep your total debt within that 36% limit.",
          },
          {
            step: 2,
            title: "Calculate your max monthly mortgage payment",
            content: "This is the mortgage payment that comes out to be 28% (or lower based on Step 1) of your monthly gross income.",
          },
          {
            step: 3,
            title: "Calculate how much you can borrow",
            content: "Now we know what you should pay each month for your house. Next we calculate the most expensive house you can afford with that constraint and your down payment, interest rate, loan term, property taxes, PMI, HOA fees, and insurance.",
          },
          {
            step: 4,
            title: "Calculate your net income",
            content: "After taxes, Social Security, and Medicare, your real take-home is what's used for the 50/30/20 budget rule.",
          },
          {
            step: 5,
            title: "Check if your mortgage fits the 50/30/20 rule",
            content: "50% needs (housing, transportation, insurance). 30% wants (entertainment, hobbies). 20% savings & extra debt payments.",
          },
          {
            step: 6,
            title: "Run different budget scenarios",
            content: "Each scenario has a different savings rate (15% and 25%). This helps you see how different home prices affect your ability to save and stay financially flexible.",
          },
          {
            step: 7,
            title: "Calculate monthly mortgage for each scenario",
            content: "Your total monthly mortgage payment will be the combination of mortgage + property taxes + insurance + HOA fees + PMI (if needed).",
          },
          {
            step: 8,
            title: "Bring it all together",
            content: "Your max home price under the 28/36 DTI rule. Comfortable home prices that allow for different rates of saving. Transaction, budget and mortgage breakdowns for each scenario.",
          },
        ].map(({ step, title, content }) => (
          <div key={step} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-black text-white text-sm font-bold flex items-center justify-center">
              {step}
            </div>
            <div>
              <h3 className="font-bold text-black mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#F3F3F3] rounded-lg p-6 md:p-8 mb-12">
        <h3 className="font-bold text-black text-lg mb-2">Key takeaway</h3>
        <p className="text-sm leading-relaxed">
          Banks approve loans based on their risk assessment, but we focus on
          your financial well-being and how comfortably you can handle
          mortgage payments. This calculator is designed to help you determine
          what you can afford without stretching your budget or compromising
          your lifestyle.
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          Avoid regret. House hunt with confidence in your budget.
        </p>
      </div>

      <div className="flex justify-center">
        <Link
          to="/"
          onClick={() => window.scrollTo(0, 0)}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-black rounded-lg hover:bg-[#333333] transition-colors"
        >
          Calculate Your Exact Budget
        </Link>
      </div>
    </div>
  );
}
