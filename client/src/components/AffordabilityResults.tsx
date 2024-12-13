import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CalculatorResults } from "@/lib/calculatorTypes";

interface AffordabilityResultsProps {
  results: CalculatorResults;
}

export function AffordabilityResults({ results }: AffordabilityResultsProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercentage = (decimal: number) =>
    new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 0 }).format(decimal);

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="assumptions">
          <AccordionTrigger className="text-lg font-semibold">
            Assumptions
          </AccordionTrigger>
          <AccordionContent>
            <Card className="p-4">
              <div className="space-y-2">
                <p>- Based on your income and current market conditions</p>
                <p>- Using current mortgage rates and standard lending criteria</p>
                <p>- Including estimated property taxes and insurance</p>
                <p>- PMI included if down payment is less than 20%</p>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Maximum Purchase Price: {formatCurrency(results.maxHomePrice.mortgagePaymentStats.purchasePrice)}</h2>
        <div className="grid gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Monthly Payment Breakdown</h3>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span>Mortgage Payment:</span>
                <span>{formatCurrency(results.maxHomePrice.mortgagePaymentStats.mortgagePayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>Property Tax:</span>
                <span>{formatCurrency(results.maxHomePrice.mortgagePaymentStats.propertyTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>PMI:</span>
                <span>{formatCurrency(results.maxHomePrice.mortgagePaymentStats.pmi)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insurance:</span>
                <span>{formatCurrency(results.maxHomePrice.mortgagePaymentStats.homeownersInsurance)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Monthly Payment:</span>
                <span>{formatCurrency(results.maxHomePrice.mortgagePaymentStats.totalPayment)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Monthly Budget</h3>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span>Housing ({formatPercentage(results.maxHomePrice.scenario.mortgage.mortgagePercentage)}):</span>
                <span>{formatCurrency(results.maxHomePrice.scenario.mortgage.mortgagePayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>Other Needs ({formatPercentage(results.maxHomePrice.scenario.remainingNeeds.percentage)}):</span>
                <span>{formatCurrency(results.maxHomePrice.scenario.remainingNeeds.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Wants ({formatPercentage(results.maxHomePrice.scenario.wants.percentage)}):</span>
                <span>{formatCurrency(results.maxHomePrice.scenario.wants.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Savings ({formatPercentage(results.maxHomePrice.scenario.savings.percentage)}):</span>
                <span>{formatCurrency(results.maxHomePrice.scenario.savings.amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {results.savingScenarios.map((scenario, index) => (
        <Card key={index} className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            {scenario.description}: {formatCurrency(scenario.mortgagePaymentStats.purchasePrice)}
          </h3>
          <div className="grid gap-4">
            <div>
              <h4 className="font-medium mb-2">Monthly Payment Breakdown</h4>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span>Mortgage Payment:</span>
                  <span>{formatCurrency(scenario.mortgagePaymentStats.mortgagePayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Monthly Payment:</span>
                  <span>{formatCurrency(scenario.mortgagePaymentStats.totalPayment)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Monthly Budget</h4>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span>Housing ({formatPercentage(scenario.scenario.mortgage.mortgagePercentage)}):</span>
                  <span>{formatCurrency(scenario.scenario.mortgage.mortgagePayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Savings ({formatPercentage(scenario.scenario.savings.percentage)}):</span>
                  <span>{formatCurrency(scenario.scenario.savings.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
