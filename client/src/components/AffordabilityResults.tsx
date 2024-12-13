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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Income Summary</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Gross Income</p>
            <p className="text-lg font-medium">{formatCurrency(results.incomeSummary.grossIncome)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Net Income</p>
            <p className="text-lg font-medium">{formatCurrency(results.incomeSummary.netIncome)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Tax</p>
            <p className="text-lg font-medium">{formatCurrency(results.incomeSummary.totalTax)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Maximum Home Price</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Purchase Price</p>
            <p className="text-lg font-medium">
              {formatCurrency(results.maxHomePrice.mortgagePaymentStats.purchasePrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Payment</p>
            <p className="text-lg font-medium">
              {formatCurrency(results.maxHomePrice.mortgagePaymentStats.totalPayment)}
            </p>
          </div>
        </div>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="scenarios">
          <AccordionTrigger>Different Saving Scenarios</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {results.savingScenarios.map((scenario, index) => (
                <Card key={index} className="p-4">
                  <h3 className="font-medium mb-2">{scenario.description}</h3>
                  <div className="grid gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Purchase Price</p>
                      <p>{formatCurrency(scenario.mortgagePaymentStats.purchasePrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p>{formatCurrency(scenario.mortgagePaymentStats.totalPayment)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
