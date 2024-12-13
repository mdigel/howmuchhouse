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
      <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">
              {formatCurrency(results.maxHomePrice.mortgagePaymentStats.purchasePrice)} Max Price You Can Afford
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
          {/* Transaction Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Transaction</h3>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Purchase Price:</span>
                <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.purchasePrice)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Loan Amount:</span>
                <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.loanAmount)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Downpayment:</span>
                <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.downpayment)}</span>
              </div>
            </div>
          </div>

          {/* Mortgage Payment Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Mortgage Payment</h3>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Total Monthly Payment:</span>
                <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.totalPayment)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Mortgage:</span>
                <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.mortgagePayment)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Property Tax:</span>
                <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.propertyTax)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">PMI:</span>
                <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.pmi)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Home Owners Insurance:</span>
                <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.homeownersInsurance)}</span>
              </div>
            </div>
          </div>

          {/* Monthly Budget Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Monthly Budget:</h3>
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Net Income:</span>
                <span className="text-lg">{formatCurrency(results.incomeSummary.netIncome / 12)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mortgage:</span>
                <div className="text-right">
                  <span className="text-lg">{formatCurrency(results.maxHomePrice.scenario.mortgage.amount)}</span>
                  <span className="text-muted-foreground ml-2">{formatPercentage(results.maxHomePrice.scenario.mortgage.percentage)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Remaining Needs:</span>
                <div className="text-right">
                  <span className="text-lg">{formatCurrency(results.maxHomePrice.scenario.remainingNeeds.amount)}</span>
                  <span className="text-muted-foreground ml-2">{formatPercentage(results.maxHomePrice.scenario.remainingNeeds.percentage)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Wants:</span>
                <div className="text-right">
                  <span className="text-lg">{formatCurrency(results.maxHomePrice.scenario.wants.amount)}</span>
                  <span className="text-muted-foreground ml-2">{formatPercentage(results.maxHomePrice.scenario.wants.percentage)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Saving:</span>
                <div className="text-right">
                  <span className="text-lg">{formatCurrency(results.maxHomePrice.scenario.savings.amount)}</span>
                  <span className="text-muted-foreground ml-2">{formatPercentage(results.maxHomePrice.scenario.savings.percentage)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {results.savingScenarios.map((scenario, index) => (
        <Card key={index} className="p-6">
          <h3 className="text-2xl font-semibold mb-6">
            {formatCurrency(scenario.mortgagePaymentStats.purchasePrice)} and save {formatPercentage(scenario.scenario.savings.percentage)} of your Net Income
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Transaction Section */}
            <div>
              <h4 className="text-lg font-medium mb-3">Transaction</h4>
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Purchase Price:</span>
                  <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.purchasePrice)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.loanAmount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Downpayment:</span>
                  <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.downpayment)}</span>
                </div>
              </div>
            </div>

            {/* Mortgage Payment Section */}
            <div>
              <h4 className="text-lg font-medium mb-3">Mortgage Payment</h4>
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Total Monthly Payment:</span>
                  <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.totalPayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Mortgage:</span>
                  <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.mortgagePayment)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Property Tax:</span>
                  <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.propertyTax)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">PMI:</span>
                  <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.pmi)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Home Owners Insurance:</span>
                  <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.homeownersInsurance)}</span>
                </div>
              </div>
            </div>

            {/* Monthly Budget Section */}
            <div>
              <h4 className="text-lg font-medium mb-3">Monthly Budget</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mortgage:</span>
                  <div className="text-right">
                    <span className="text-lg">{formatCurrency(scenario.scenario.mortgage.amount)}</span>
                    <span className="text-muted-foreground ml-2">{formatPercentage(scenario.scenario.mortgage.percentage)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Wants:</span>
                  <div className="text-right">
                    <span className="text-lg">{formatCurrency(scenario.scenario.wants.amount)}</span>
                    <span className="text-muted-foreground ml-2">{formatPercentage(scenario.scenario.wants.percentage)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Saving:</span>
                  <div className="text-right">
                    <span className="text-lg">{formatCurrency(scenario.scenario.savings.amount)}</span>
                    <span className="text-muted-foreground ml-2">{formatPercentage(scenario.scenario.savings.percentage)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}