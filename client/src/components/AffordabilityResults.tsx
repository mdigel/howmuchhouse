import * as React from "react";
import { Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={isMobile ? isOpen : undefined} delayDuration={0}>
        <TooltipTrigger asChild>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isMobile) {
                setIsOpen(!isOpen);
              }
            }}
            className="touch-manipulation"
          >
            <Info className="h-4 w-4 ml-2 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={isMobile ? "bottom" : "right"} 
          align={isMobile ? "center" : "start"}
          className="max-w-[280px] touch-none"
          sideOffset={isMobile ? 5 : 4}
        >
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { AffordabilitySkeleton } from "@/components/ui/affordability-skeleton";

export function AffordabilityResults({ results, isLoading = false }: AffordabilityResultsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const formatPercentage = (decimal: number) =>
    new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 0 }).format(decimal);

  const calculateClosingCosts = (loanAmount: number) => {
    if (loanAmount <= 200000) {
      return {
        min: loanAmount * 0.04,
        max: loanAmount * 0.05
      };
    } else if (loanAmount <= 1000000) {
      return {
        min: loanAmount * 0.03,
        max: loanAmount * 0.04
      };
    } else {
      return {
        min: loanAmount * 0.02,
        max: loanAmount * 0.03
      };
    }
  };

  if (isLoading) {
    return <AffordabilitySkeleton />;
  }

  const generateCsv = (data: any, isMaxPrice: boolean) => {
    const scenario = isMaxPrice ? data.maxHomePrice : data;
    const { mortgagePaymentStats, scenario: budgetScenario } = scenario;

    const headers = ["Category", "Amount", "Details"].join(",");

    const rows = [
      ["Purchase Price", mortgagePaymentStats.purchasePrice, "Total home price"],
      ["Loan Amount", mortgagePaymentStats.loanAmount, "Amount borrowed"],
      ["Down Payment", mortgagePaymentStats.downpayment, "Initial payment"],
      ["Total Monthly Payment", mortgagePaymentStats.totalPayment, "Total housing payment"],
      ["Mortgage Payment", mortgagePaymentStats.mortgagePayment, "Principal and interest"],
      ["Property Tax", mortgagePaymentStats.propertyTax, "Monthly property tax"],
      ["PMI", mortgagePaymentStats.pmi, "Private Mortgage Insurance"],
      ["Home Insurance", mortgagePaymentStats.homeownersInsurance, "Monthly insurance premium"],
      ["Monthly Net Income", results.incomeSummary.netIncome / 12, "After-tax income"],
      ["Mortgage Budget", budgetScenario.mortgage.amount, `${(budgetScenario.mortgage.percentage * 100).toFixed(0)}% of income`],
      ["Remaining Needs", budgetScenario.remainingNeeds.amount, `${(budgetScenario.remainingNeeds.percentage * 100).toFixed(0)}% of income`],
      ["Wants Budget", budgetScenario.wants.amount, `${(budgetScenario.wants.percentage * 100).toFixed(0)}% of income`],
      ["Savings", budgetScenario.savings.amount, `${(budgetScenario.savings.percentage * 100).toFixed(0)}% of income`],
    ].map((row) => row.join(","));

    return [headers, ...rows].join("\n");
  };

  const downloadCsv = (data: any, isMaxPrice: boolean) => {
    const csv = generateCsv(data, isMaxPrice);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isMaxPrice ? "max-price-scenario.csv" : "saving-scenario.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 AffordabilityResults">
      <Accordion type="single" collapsible className="w-full">
        {/* Max Price Result */}
        <AccordionItem value="item-0">
          <AccordionTrigger className="text-2xl font-semibold py-6 px-6 bg-card rounded-lg hover:no-underline hover:bg-accent group">
            <div className="flex flex-col w-full">
              <span className="text-sm md:text-lg text-foreground group-hover:text-foreground transition-colors mb-2 text-left w-full">
                Max Price The Bank Will Allow
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥵</span>
                  <span className="text-[2rem] font-bold text-destructive">
                    {formatCurrency(results.maxHomePrice.mortgagePaymentStats.purchasePrice).split(".")[0]}
                  </span>
                </div>
                <span className="self-start px-3 py-1 text-sm font-medium bg-destructive/15 text-destructive rounded-lg border border-destructive/30">
                  House Poor Risk
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-6 px-6 bg-card rounded-lg">
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              This scenario reflects the highest house price the bank/lender will allow under the '28/36 rule,' (<a href="https://www.nerdwallet.com/article/mortgages/debt-income-ratio-mortgage" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NerdWallet</a>) which says your mortgage payment (principal, interest, taxes, and insurance) shouldn't exceed 28% of your gross income, and your total debt shouldn't exceed 36%. However, buyers with strong credit, extra savings, or other factors can sometimes qualify above these thresholds.
            </p>
            <div className="hidden md:block">
              <button
                onClick={() => downloadCsv(results, true)}
                className="mb-8 inline-flex items-center px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded transition-colors"
              >
                Download CSV
              </button>
            </div>
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
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.purchasePrice).split(".")[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Loan Amount
                        <InfoTooltip text="The amount you'll need to borrow from the lender after your down payment" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.loanAmount).split(".")[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Downpayment
                        <InfoTooltip text="The initial payment you'll make upfront to purchase the home" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.downpayment).split(".")[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Estimated Closing Costs
                        <InfoTooltip text="Additional costs associated with completing your real estate transaction, including lender fees, title insurance, first mortgage payment, and other expenses" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(calculateClosingCosts(results.maxHomePrice.mortgagePaymentStats.loanAmount).min).split(".")[0]} - {" "}
                        {formatCurrency(calculateClosingCosts(results.maxHomePrice.mortgagePaymentStats.loanAmount).max).split(".")[0]}
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
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.totalPayment).split(".")[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Mortgage
                        <InfoTooltip text="Your base monthly payment towards the principal and interest of your loan" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.mortgagePayment).split(".")[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Property Tax
                        <InfoTooltip text="Annual property taxes divided into monthly payments" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.propertyTax).split(".")[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        PMI
                        <InfoTooltip text="Private Mortgage Insurance typically required when down payment is less than 20%" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.pmi).split(".")[0]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center text-sm">
                        Home Owners Insurance
                        <InfoTooltip text="Required insurance to protect your home and its contents" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.maxHomePrice.mortgagePaymentStats.homeownersInsurance).split(".")[0]}
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
                      <InfoTooltip text="Your monthly income after taxes and deductions, State specific" />
                    </span>
                    <span className="text-lg">{formatCurrency(results.incomeSummary.netIncome / 12)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center">
                      Mortgage
                      <InfoTooltip text="Portion of your monthly income allocated to your mortgage payment" />
                    </span>
                    <div className="text-right">
                      <span className="text-lg">{formatCurrency(results.maxHomePrice.scenario.mortgage.amount)}</span>
                      <span className="text-muted-foreground ml-2">{formatPercentage(results.maxHomePrice.scenario.mortgage.percentage)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center">
                      Monthly Debt
                      <InfoTooltip text="Your current monthly debt payments including car loans, student loans, credit cards, etc." />
                    </span>
                    <div className="text-right">
                      <span className="text-lg">{formatCurrency(results.monthlyDebt || 0)}</span>
                      <span className="text-muted-foreground ml-2">
                        {formatPercentage((results.monthlyDebt || 0) / (results.incomeSummary.netIncome / 12))}
                      </span>
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
              <div className="flex flex-col w-full">
                <span className="text-sm md:text-lg text-foreground group-hover:text-foreground transition-colors mb-2 text-left w-full">
                  Save <span className="text-[#22C55E]">{formatPercentage(scenario.scenario.savings.percentage)}</span>{" "}
                  of your Net Income each month
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[2rem]">🙂</span>
                    <span className="text-[2rem] font-bold text-primary">
                      {formatCurrency(scenario.mortgagePaymentStats.purchasePrice).split(".")[0]}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 px-6 bg-card rounded-lg">
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                If you want to save {formatPercentage(scenario.scenario.savings.percentage)} of your Net Income, consider buying a home priced at around {formatCurrency(scenario.mortgagePaymentStats.purchasePrice).split(".")[0]}.
                {"\n\n"}
                For budgeting, we used <a href="https://www.nerdwallet.com/article/finance/nerdwallet-budget-calculator" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NerdWallet's 50/30/20 Budget Rule</a> when possible. (50% Needs, 30% Wants, 20% Saving).
              </p>
              <div className="hidden md:block">
                <button
                  onClick={() => downloadCsv(scenario, false)}
                  className="mb-8 inline-flex items-center px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded transition-colors"
                >
                  Download CSV
                </button>
              </div>
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
                          {formatCurrency(scenario.mortgagePaymentStats.purchasePrice).split(".")[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Loan Amount
                          <InfoTooltip text="The amount you'll need to borrow from the lender after your down payment" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.loanAmount).split(".")[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Downpayment
                          <InfoTooltip text="The initial payment you'll make upfront to purchase the home" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.downpayment).split(".")[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Estimated Closing Costs
                          <InfoTooltip text="Additional costs associated with completing your real estate transaction, including lender fees, title insurance, first mortgage payment, and other expenses" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(calculateClosingCosts(scenario.mortgagePaymentStats.loanAmount).min).split(".")[0]} - {" "}
                          {formatCurrency(calculateClosingCosts(scenario.mortgagePaymentStats.loanAmount).max).split(".")[0]}
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
                          {formatCurrency(scenario.mortgagePaymentStats.totalPayment).split(".")[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Mortgage
                          <InfoTooltip text="Your base monthly payment towards the principal and interest of your loan" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.mortgagePayment).split(".")[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Property Tax
                          <InfoTooltip text="Annual property taxes divided into monthly payments" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.propertyTax).split(".")[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          PMI
                          <InfoTooltip text="Private Mortgage Insurance typically required when down payment is less than 20%" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.pmi).split(".")[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground flex items-center text-sm">
                          Home Owners Insurance
                          <InfoTooltip text="Required insurance to protect your home and its contents" />
                        </span>
                        <span className="text-lg">
                          {formatCurrency(scenario.mortgagePaymentStats.homeownersInsurance).split(".")[0]}
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
                        <InfoTooltip text="Your monthly income after taxes and deductions, State specific" />
                      </span>
                      <span className="text-lg">
                        {formatCurrency(results.incomeSummary.netIncome / 12)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center">
                        Mortgage
                        <InfoTooltip text="Portion of your monthly income allocated to your mortgage payment" />
                      </span>
                      <div className="text-right">
                        <span className="text-lg">{formatCurrency(scenario.scenario.mortgage.amount)}</span>
                        <span className="text-muted-foreground ml-2">{formatPercentage(scenario.scenario.mortgage.percentage)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center">
                        Monthly Debt
                        <InfoTooltip text="Your current monthly debt payments including car loans, student loans, credit cards, etc." />
                      </span>
                      <div className="text-right">
                        <span className="text-lg">{formatCurrency(results.monthlyDebt)}</span>
                        <span className="text-muted-foreground ml-2">
                          {formatPercentage(results.monthlyDebt / (results.incomeSummary.netIncome / 12))}
                        </span>
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