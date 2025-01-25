import React from 'react';
import { Link, useParams } from 'wouter';
import { AffordabilitySkeleton } from '../components/ui/affordability-skeleton';

type Params = {
  income?: string;
  state?: string;
}

export default function AffordabilityByState() {
  const params = useParams<Params>();
  const { income, state } = params;
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!income || !state) return;

    // Use the existing calculator API
    fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        householdIncome: parseInt(income.replace('k', '000') || '0'),
        downPayment: parseInt(income.replace('k', '000') || '0') * 0.2,
        monthlyDebt: 500,
        annualInterestRate: 7.5,
        loanTermYears: 30,
        state: state,
        filingStatus: "single"
      }),
    })
      .then(res => res.json())
      .then(result => {
        setData(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, [income, state]);

  if (isLoading) {
    return <AffordabilitySkeleton />;
  }

  if (!data || data.error || !income || !state) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p>Sorry, we couldn't calculate the affordability for this scenario.</p>
        <Link href="/affordability-by-income-level" className="text-blue-600 hover:underline">
          Return to Income Levels
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        How much house can I afford with {income} salary in {state.charAt(0).toUpperCase() + state.slice(1)}?
      </h1>
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
        <div className="space-y-4">
          <p>
            <strong>Maximum Home Price:</strong> ${new Intl.NumberFormat().format(data.maxMortgageStats.mortgagePaymentStats.purchasePrice)}
          </p>
          <p>
            <strong>Monthly Payment:</strong> ${new Intl.NumberFormat().format(data.maxMortgageStats.mortgagePaymentStats.monthlyMortgagePayment)}
          </p>
          <p>
            <strong>Down Payment:</strong> ${new Intl.NumberFormat().format(parseInt(income.replace('k', '000') || '0') * 0.2)}
          </p>
        </div>
      </div>
      <Link href="/affordability-by-income-level" className="text-blue-600 hover:underline">
        View Other Income Levels
      </Link>
    </div>
  );
}