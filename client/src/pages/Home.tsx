import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BasicInputs, basicInputSchema } from "@/components/BasicInputs";
import { AdvancedInputs, advancedInputSchema } from "@/components/AdvancedInputs";
import { AffordabilityResults } from "@/components/AffordabilityResults";
import { AiChat } from "@/components/AiChat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BasicInputType, AdvancedInputType, CalculatorResults } from "@/lib/calculatorTypes";

export default function Home() {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  
  const basicForm = useForm<BasicInputType>({
    resolver: zodResolver(basicInputSchema),
    defaultValues: {
      householdIncome: "",
      downPayment: "",
      annualInterestRate: "",
      loanTermYears: "30",
      state: "",
      filingStatus: "single"
    }
  });

  const advancedForm = useForm<AdvancedInputType>({
    resolver: zodResolver(advancedInputSchema),
    defaultValues: {
      hoaFees: "0",
      homeownersInsurance: "1915",
      pmiInput: null,
      propertyTaxInput: null,
      pretaxContributions: "0",
      dependents: "0"
    }
  });

  const handleCalculate = async () => {
    try {
      const basicValid = await basicForm.trigger();
      const advancedValid = await advancedForm.trigger();

      console.log('Form validation results:', { basicValid, advancedValid });
      console.log('Form errors:', basicForm.formState.errors, advancedForm.formState.errors);

      if (!basicValid || !advancedValid) {
        console.log('Form validation failed');
        return;
      }

      const basicData = basicForm.getValues();
      const advancedData = advancedForm.getValues();

      console.log('Sending calculation request with data:', { ...basicData, ...advancedData });

      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...basicData,
          ...advancedData,
          // Ensure numbers are properly parsed
          householdIncome: Number(basicData.householdIncome),
          downPayment: Number(basicData.downPayment),
          annualInterestRate: Number(basicData.annualInterestRate),
          loanTermYears: Number(basicData.loanTermYears),
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Calculation failed: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received calculation results:', data);
      setResults(data);
    } catch (error) {
      console.error('Failed to calculate:', error);
      // You might want to show this error to the user with a toast notification
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">HowMuchHouseCanIAfford.ai</h1>
          <p className="text-muted-foreground">The smartest AI for the biggest purchase of your life</p>
        </div>

        <Card className="p-6 space-y-6">
          <BasicInputs form={basicForm} />
          <AdvancedInputs form={advancedForm} />
          <Button 
            onClick={handleCalculate}
            className="w-full max-w-md bg-gradient-to-r from-primary to-primary/90 hover:to-primary"
          >
            Calculate
          </Button>
        </Card>

        {results && (
          <>
            <AffordabilityResults results={results} />
            <AiChat calculatorData={results} />
          </>
        )}
      </div>
    </div>
  );
}
