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
        {/* Max Price Result */}
        <AccordionItem value="item-0">
          <AccordionTrigger className="text-2xl font-semibold py-6 px-6 bg-card rounded-lg hover:no-underline hover:bg-accent group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥵</span>
                <span className="text-[2rem] font-bold text-primary">
                  {formatCurrency(results.maxHomePrice.mortgagePaymentStats.purchasePrice).split('.')[0]}
                </span>
              </div>
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                Max Price You Can Afford
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-6 px-6 bg-card rounded-lg">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csvContent = [
                    ['Category', 'Amount'],
                    ['Purchase Price', results.maxHomePrice.mortgagePaymentStats.purchasePrice],
                    ['Loan Amount', results.maxHomePrice.mortgagePaymentStats.loanAmount],
                    ['Down Payment', results.maxHomePrice.mortgagePaymentStats.downpayment],
                    ['Monthly Payment', results.maxHomePrice.mortgagePaymentStats.totalPayment],
                    ['Mortgage Payment', results.maxHomePrice.mortgagePaymentStats.mortgagePayment],
                    ['Property Tax', results.maxHomePrice.mortgagePaymentStats.propertyTax],
                    ['PMI', results.maxHomePrice.mortgagePaymentStats.pmi],
                    ['Home Insurance', results.maxHomePrice.mortgagePaymentStats.homeownersInsurance],
                    ['HOA', results.maxHomePrice.mortgagePaymentStats.hoa],
                    ['Monthly Net Income', results.maxHomePrice.scenario.monthlyNetIncome],
                    ['Monthly Mortgage', results.maxHomePrice.scenario.mortgage.amount],
                    ['Monthly Wants', results.maxHomePrice.scenario.wants.amount],
                    ['Monthly Needs', results.maxHomePrice.scenario.remainingNeeds.amount],
                    ['Monthly Savings', results.maxHomePrice.scenario.savings.amount],
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = 'max_price_scenario.csv';
                  link.click();
                }}
              >
                Download CSV
              </Button>
            </div>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              This scenario represents the maximum house price you can afford while maintaining a balanced budget. 
              It aims to keep your mortgage payment at a sustainable level while ensuring you have enough for other expenses and savings.
            </p>
            <div className="space-y-8">
              {/* First row: Transaction and Mortgage Payment */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Transaction Section */}
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-6">Transaction</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Purchase Price
                        <InfoTooltip text="The total price of the home you can purchase in this scenario" />
                      </span>
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.purchasePrice).split('.')[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Loan Amount
                        <InfoTooltip text="The amount you'll need to borrow from the lender after your down payment" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.loanAmount).split('.')[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Downpayment
                        <InfoTooltip text="The initial payment you'll make upfront to purchase the home" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.downpayment).split('.')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mortgage Payment Section */}
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-6">Mortgage Payment</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Total Monthly Payment
                        <InfoTooltip text="Your complete monthly housing payment including mortgage, taxes, insurance, and other fees" />
                      </span>
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.totalPayment).split('.')[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Mortgage
                        <InfoTooltip text="Your base monthly payment towards the principal and interest of your loan" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.mortgagePayment).split('.')[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Property Tax
                        <InfoTooltip text="Annual property taxes divided into monthly payments" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.propertyTax).split('.')[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        PMI
                        <InfoTooltip text="Private Mortgage Insurance required when down payment is less than 20%" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.pmi).split('.')[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Home Owners Insurance
                        <InfoTooltip text="Required insurance to protect your home and its contents" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.homeownersInsurance).split('.')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second row: Monthly Budget (full width) */}
              <div className="bg-muted/30 p-6 rounded-lg w-full">
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

        {/* Saving Scenarios */}
        {results.savingScenarios.map((scenario, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger className="text-2xl font-semibold py-6 px-6 bg-card rounded-lg hover:no-underline hover:bg-accent group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🙂</span>
                  <span className="text-[2rem] font-bold text-primary">
                    {formatCurrency(scenario.mortgagePaymentStats.purchasePrice).split('.')[0]}
                  </span>
                </div>
                <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                  and save {formatPercentage(scenario.scenario.savings.percentage)} of your Net Income
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 px-6 bg-card rounded-lg">
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csvContent = [
                      ['Category', 'Amount'],
                      ['Purchase Price', scenario.mortgagePaymentStats.purchasePrice],
                      ['Loan Amount', scenario.mortgagePaymentStats.loanAmount],
                      ['Down Payment', scenario.mortgagePaymentStats.downpayment],
                      ['Monthly Payment', scenario.mortgagePaymentStats.totalPayment],
                      ['Mortgage Payment', scenario.mortgagePaymentStats.mortgagePayment],
                      ['Property Tax', scenario.mortgagePaymentStats.propertyTax],
                      ['PMI', scenario.mortgagePaymentStats.pmi],
                      ['Home Insurance', scenario.mortgagePaymentStats.homeownersInsurance],
                      ['HOA', scenario.mortgagePaymentStats.hoa],
                      ['Monthly Net Income', results.incomeSummary.netIncome / 12],
                      ['Monthly Mortgage', scenario.scenario.mortgage.amount],
                      ['Monthly Wants', scenario.scenario.wants.amount],
                      ['Monthly Needs', scenario.scenario.remainingNeeds.amount],
                      ['Monthly Savings', scenario.scenario.savings.amount],
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `saving_scenario_${index + 1}.csv`;
                    link.click();
                  }}
                >
                  Download CSV
                </Button>
              </div>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                This scenario shows what your budget would look like if you purchased a home for {formatCurrency(scenario.mortgagePaymentStats.purchasePrice).split('.')[0]}.
                By choosing a more affordable home, you can save {formatPercentage(scenario.scenario.savings.percentage)} of your income for other financial goals.
              </p>
              <div className="space-y-8">
                {/* First row: Transaction and Mortgage Payment */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Transaction Section */}
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-6">Transaction</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Purchase Price
                          <InfoTooltip text="The total price of the home you can purchase in this scenario" />
                        </span>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(scenario.mortgagePaymentStats.purchasePrice).split('.')[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Loan Amount
                          <InfoTooltip text="The amount you'll need to borrow from the lender after your down payment" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.loanAmount).split('.')[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Downpayment
                          <InfoTooltip text="The initial payment you'll make upfront to purchase the home" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.downpayment).split('.')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mortgage Payment Section */}
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-6">Mortgage Payment</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Total Monthly Payment
                          <InfoTooltip text="Your complete monthly housing payment including mortgage, taxes, insurance, and other fees" />
                        </span>
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(scenario.mortgagePaymentStats.totalPayment).split('.')[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Mortgage
                          <InfoTooltip text="Your base monthly payment towards the principal and interest of your loan" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.mortgagePayment).split('.')[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Property Tax
                          <InfoTooltip text="Annual property taxes divided into monthly payments" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.propertyTax).split('.')[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          PMI
                          <InfoTooltip text="Private Mortgage Insurance required when down payment is less than 20%" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.pmi).split('.')[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Home Owners Insurance
                          <InfoTooltip text="Required insurance to protect your home and its contents" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.homeownersInsurance).split('.')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Budget Section */}
                <div className="bg-muted/30 p-6 rounded-lg w-full">
                  <h3 className="text-xl font-semibold mb-4">Monthly Budget</h3>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center">
                        Net Income
                        <InfoTooltip text="Your monthly income after taxes and deductions" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.incomeSummary.netIncome / 12)}
                      </span>
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
