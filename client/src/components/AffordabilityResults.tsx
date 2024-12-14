import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface InfoTooltipProps {
  text: string;
}

function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="inline-block w-4 h-4 ml-1 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function AffordabilityResults({ results }: AffordabilityResultsProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercentage = (decimal: number) =>
    new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 0 }).format(decimal);

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-0">
          <AccordionTrigger className="text-2xl font-semibold py-6 px-6 bg-card rounded-lg hover:no-underline hover:bg-accent">
            {formatCurrency(results.maxHomePrice.mortgagePaymentStats.purchasePrice)} Max Price You Can Afford
          </AccordionTrigger>
          <AccordionContent className="pt-6 px-6 bg-card rounded-lg">
            <p className="text-muted-foreground mb-6">
              This scenario represents the maximum house price you can afford while maintaining a balanced budget. 
              It aims to keep your mortgage payment at a sustainable level while ensuring you have enough for other expenses and savings.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Transaction Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Transaction</h3>
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground flex items-center">
                      Purchase Price
                      <InfoTooltip text="The total price of the home you can purchase in this scenario" />
                    </span>
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
          </AccordionContent>
        </AccordionItem>

        {results.savingScenarios.map((scenario, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger className="text-2xl font-semibold py-6 px-6 bg-card rounded-lg hover:no-underline hover:bg-accent">
              {formatCurrency(scenario.mortgagePaymentStats.purchasePrice)} and save {formatPercentage(scenario.scenario.savings.percentage)} of your Net Income
            </AccordionTrigger>
            <AccordionContent className="pt-6 px-6 bg-card rounded-lg">
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
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Net Income:</span>
                      <span className="text-lg">{formatCurrency(results.incomeSummary.netIncome / 12)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Mortgage:</span>
                      <div className="text-right">
                        <span className="text-lg">{formatCurrency(scenario.scenario.mortgage.amount)}</span>
                        <span className="text-muted-foreground ml-2">{formatPercentage(scenario.scenario.mortgage.percentage)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Remaining Needs:</span>
                      <div className="text-right">
                        <span className="text-lg">{formatCurrency(scenario.scenario.remainingNeeds.amount)}</span>
                        <span className="text-muted-foreground ml-2">{formatPercentage(scenario.scenario.remainingNeeds.percentage)}</span>
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
