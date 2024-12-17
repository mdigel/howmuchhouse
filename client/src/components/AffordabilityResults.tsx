import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
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
  isLoading?: boolean;
}

interface InfoTooltipProps {
  text: string;
}

function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 ml-2 text-muted-foreground hover:text-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="max-w-[280px]">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { AffordabilitySkeleton } from "@/components/ui/affordability-skeleton";

export function AffordabilityResults({ results, isLoading = false }: AffordabilityResultsProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercentage = (decimal: number) =>
    new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 0 }).format(decimal);

  if (isLoading) {
    return <AffordabilitySkeleton />;
  }

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
                    <span className="text-muted-foreground flex items-center">
                      Loan Amount
                      <InfoTooltip text="The amount you'll need to borrow from the lender after your down payment" />
                    </span>
                    <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.loanAmount)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground flex items-center">
                      Downpayment
                      <InfoTooltip text="The initial payment you'll make upfront to purchase the home" />
                    </span>
                    <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.downpayment)}</span>
                  </div>
                </div>
              </div>

              {/* Mortgage Payment Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Mortgage Payment</h3>
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground flex items-center">
                      Total Monthly Payment
                      <InfoTooltip text="Your complete monthly housing payment including mortgage, taxes, insurance, and other fees" />
                    </span>
                    <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.totalPayment)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground flex items-center">
                      Mortgage
                      <InfoTooltip text="Your base monthly payment towards the principal and interest of your loan" />
                    </span>
                    <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.mortgagePayment)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground flex items-center">
                      Property Tax
                      <InfoTooltip text="Annual property taxes divided into monthly payments" />
                    </span>
                    <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.propertyTax)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground flex items-center">
                      PMI
                      <InfoTooltip text="Private Mortgage Insurance required when down payment is less than 20%" />
                    </span>
                    <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.pmi)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground flex items-center">
                      Home Owners Insurance
                      <InfoTooltip text="Required insurance to protect your home and its contents" />
                    </span>
                    <span className="text-lg">{formatCurrency(results.maxHomePrice.mortgagePaymentStats.homeownersInsurance)}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Budget Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Monthly Budget</h3>
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground flex items-center">
                      Net Income
                      <InfoTooltip text="Your monthly income after taxes and deductions" />
                    </span>
                    <span className="text-lg">{formatCurrency(results.incomeSummary.netIncome / 12)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center">
                      Mortgage
                      <InfoTooltip text="Portion of your monthly income allocated to housing expenses" />
                    </span>
                    <div className="text-right">
                      <span className="text-lg">{formatCurrency(results.maxHomePrice.scenario.mortgage.amount)}</span>
                      <span className="text-muted-foreground ml-2">{formatPercentage(results.maxHomePrice.scenario.mortgage.percentage)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center">
                      Remaining Needs
                      <InfoTooltip text="Essential expenses like utilities, groceries, and healthcare" />
                    </span>
                    <div className="text-right">
                      <span className="text-lg">{formatCurrency(results.maxHomePrice.scenario.remainingNeeds.amount)}</span>
                      <span className="text-muted-foreground ml-2">{formatPercentage(results.maxHomePrice.scenario.remainingNeeds.percentage)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center">
                      Wants
                      <InfoTooltip text="Discretionary spending on entertainment, dining out, and hobbies" />
                    </span>
                    <div className="text-right">
                      <span className="text-lg">{formatCurrency(results.maxHomePrice.scenario.wants.amount)}</span>
                      <span className="text-muted-foreground ml-2">{formatPercentage(results.maxHomePrice.scenario.wants.percentage)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center">
                      Saving
                      <InfoTooltip text="Money set aside for future goals, emergencies, and investments" />
                    </span>
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
              <p className="text-muted-foreground mb-6">
                This scenario shows what your budget would look like if you purchased a home for {formatCurrency(scenario.mortgagePaymentStats.purchasePrice)}.
                By choosing a more affordable home, you can save {formatPercentage(scenario.scenario.savings.percentage)} of your income for other financial goals.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Transaction Section */}
                <div>
                  <h4 className="text-lg font-medium mb-3">Transaction</h4>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        Purchase Price
                        <InfoTooltip text="The total price of the home you can purchase in this scenario" />
                      </span>
                      <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.purchasePrice)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        Loan Amount
                        <InfoTooltip text="The amount you'll need to borrow from the lender after your down payment" />
                      </span>
                      <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.loanAmount)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        Downpayment
                        <InfoTooltip text="The initial payment you'll make upfront to purchase the home" />
                      </span>
                      <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.downpayment)}</span>
                    </div>
                  </div>
                </div>

                {/* Mortgage Payment Section */}
                <div>
                  <h4 className="text-lg font-medium mb-3">Mortgage Payment</h4>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        Total Monthly Payment
                        <InfoTooltip text="Your complete monthly housing payment including mortgage, taxes, insurance, and other fees" />
                      </span>
                      <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.totalPayment)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        Mortgage
                        <InfoTooltip text="Your base monthly payment towards the principal and interest of your loan" />
                      </span>
                      <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.mortgagePayment)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        Property Tax
                        <InfoTooltip text="Annual property taxes divided into monthly payments" />
                      </span>
                      <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.propertyTax)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        PMI
                        <InfoTooltip text="Private Mortgage Insurance required when down payment is less than 20%" />
                      </span>
                      <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.pmi)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        Home Owners Insurance
                        <InfoTooltip text="Required insurance to protect your home and its contents" />
                      </span>
                      <span className="text-lg">{formatCurrency(scenario.mortgagePaymentStats.homeownersInsurance)}</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Budget Section */}
                <div>
                  <h4 className="text-lg font-medium mb-3">Monthly Budget</h4>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        Net Income
                        <InfoTooltip text="Your monthly income after taxes and deductions" />
                      </span>
                      <span className="text-lg">{formatCurrency(results.incomeSummary.netIncome / 12)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center">
                        Mortgage
                        <InfoTooltip text="Portion of your monthly income allocated to housing expenses" />
                      </span>
                      <div className="text-right">
                        <span className="text-lg">{formatCurrency(scenario.scenario.mortgage.amount)}</span>
                        <span className="text-muted-foreground ml-2">{formatPercentage(scenario.scenario.mortgage.percentage)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center">
                        Remaining Needs
                        <InfoTooltip text="Essential expenses like utilities, groceries, and healthcare" />
                      </span>
                      <div className="text-right">
                        <span className="text-lg">{formatCurrency(scenario.scenario.remainingNeeds.amount)}</span>
                        <span className="text-muted-foreground ml-2">{formatPercentage(scenario.scenario.remainingNeeds.percentage)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center">
                        Wants
                        <InfoTooltip text="Discretionary spending on entertainment, dining out, and hobbies" />
                      </span>
                      <div className="text-right">
                        <span className="text-lg">{formatCurrency(scenario.scenario.wants.amount)}</span>
                        <span className="text-muted-foreground ml-2">{formatPercentage(scenario.scenario.wants.percentage)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center">
                        Saving
                        <InfoTooltip text="Money set aside for future goals, emergencies, and investments" />
                      </span>
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
