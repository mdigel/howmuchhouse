import React from "react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold">
        🏠 We weren't going to buy a house for another 6 months.
      </h1>
      <br />
      <p>But then we fell in love with a house and HAD to make an offer.</p>
      <br />
      <p>
        The next 3 days were some of the most stressful of my life. What can we
        actaully afford? Am I signing us up to be stressed out for the next 10
        years? I hadn't done the analysis yet.
      </p>
      <br />
      <p>
        I ended up relying a ton on Ai for scenario planning. This calculator
        and Ai assistant is what I wish I had then.
      </p>
      <br />
      <p>
        We built this calculator using time-tested financial principles
        (shoutout to NerdWallet & MoneyUnder30) to help you stay stress-free.
        Here's how it works 🧵👇
      </p>
      <br />
      <h2 className="text-lg font-semibold">
        First, timeless financial principles:
      </h2>
      <br />
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        {" "}
        {/* Added styled container */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">
              ✅ 28/36 DTI Rule (Debt-to-Income Ratio):
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Front-end DTI = Mortgage payment... this shouldn't be more than
                28% of gross income
              </li>
              <li>
                Back-end DTI = Total debt payments... this shouldn't be more
                than 36% of gross income
              </li>
            </ul>
            <p className="mt-2">
              Banks look at DIR to decide how much you can borrow.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">✅ 50/30/20 budget:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                50% needs (housing, transportation, minimum debt payments, etc.)
              </li>
              <li>30% wants (fun stuff)</li>
              <li>20% savings</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">✅ 3-4x income rule:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Purchase a home for no more than 3-4x your annual income</li>
            </ul>
            <br />
            <p className="mt-2">
              These principles help protect your finances and prevent buyer's
              remorse. Let's dive into how the calculator works 👇
            </p>
          </div>
        </div>
      </div>{" "}
      {/* Closing the added container */}
      <br />
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">
            Step 1: We analyze your DTI.
          </h3>
          <p>
            Usually, lenders want your total debt-to-income ratio (back-end DIR)
            to stay under 36%. If your current debts already take up 8% or more
            of your gross income, we'll need to lower the max front-end DIR
            (housing expenses) from 28% to keep your total debt within that 36%
            limit.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Step 2: We calculate your max monthly mortgage payment based on the
            28/36:
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <p>
              This is the mortgage payment that comes out to be 28% (or lower
              based on Step 1) of your monthly gross income.
            </p>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Step 3: We calculate how much you can borrow based on that payment.
          </h3>
          <p>
            Now we know what you should pay each much for your house. Next we
            calculate the most expensive house you can afford with that
            constraint and these inputs:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Down payment</li>
            <li>Interest rate</li>
            <li>Loan term</li>
            <li>Property taxes, PMI, HOA fees, and insurance</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Step 4: We calculate your net income.
          </h3>
          <p>
            After taxes, Social Security, and Medicare, your real take-home is
            what's used for the 50/30/20 budget rule.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Step 5: We check if your mortgage fits the 50/30/20 rule:
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>50% needs (housing, transportation, insurance)</li>
            <li>30% wants (entertainment, hobbies)</li>
            <li>20% savings & extra debt payments 💰</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Step 6: We run different budget scenarios.
          </h3>
          <p>
            Each scenario has a different savings rate (15% and 25%). This helps
            you see how different home prices affect your ability to save and
            stay financially flexible.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Step 7: We calculate the monthly mortgage payment for each scenario:
          </h3>
          <p>Your total monthly mortgage payment will be the combination of:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Mortgage + property taxes + insurance + HOA fees + PMI (if
              needed).
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Step 8: We bring it all together:
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your max home price under the 28/36 DIR Rule 🏦</li>
            <li>
              Comfortable home prices that allow for different rates of saving
              💰
            </li>
            <li>
              Transaction, Budget and Mortgage breakdowns for each scenario 📊
            </li>
          </ul>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold">🔑 Key takeaway:</h3>
          <p>
            Banks approve loans based on their risk assessment, but we focus on
            your financial well-being and how comfortably you can handle
            mortgage payments. This calculator is designed to help you determine
            what you can afford without stretching your budget or compromising
            your lifestyle.
          </p>
          <p className="mt-2">
            Avoid regret. House hunt with confidence in your budget. 😴🏡
          </p>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <Link
          to="/"
          onClick={() => window.scrollTo(0, 0)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Calculate Your Exact Budget 🏠
        </Link>
      </div>
    </div>
  );
}
