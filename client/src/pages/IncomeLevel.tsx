import React from 'react';
import { Link } from 'wouter';

// Define income levels and states (matching server-side)
const incomes = [
  "30k", "50k", "70k", "90k", "110k",
  "130k", "150k", "170k", "190k",
  "210k", "250k", "300k", "400k"
];

const states = [
  "california", "texas", "new-york", "florida",
  "illinois", "pennsylvania", "ohio", "georgia",
  "michigan", "north-carolina"
];

export default function IncomeLevel() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Home Affordability by Income Level</h1>
      <p className="mb-6">Select your income level to see how much house you can afford in different states:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incomes.map((income) => (
          <div key={income} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-3">${income} Annual Income</h2>
            <ul className="space-y-2">
              {states.slice(0, 5).map(state => (
                <li key={state}>
                  <Link 
                    href={`/${income}/${state}`}
                    className="text-blue-600 hover:underline"
                  >
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
