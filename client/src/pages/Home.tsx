import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BasicInputs, basicInputSchema } from "@/components/BasicInputs";
import { AdvancedInputs, advancedInputSchema } from "@/components/AdvancedInputs";
import { AffordabilityResults } from "@/components/AffordabilityResults";
import { AiChat } from "@/components/AiChat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BasicInputType, AdvancedInputType, CalculatorResults } from "@/lib/calculatorTypes";

// Define custom event types
interface RestoreInputsEvent extends CustomEvent {
  detail: {
    inputs: {
      basic?: Record<string, string | number>;
      advanced?: Record<string, string | number | null>;
    };
  };
}

export default function Home() {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
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

  // Add event listeners for state restoration after payment
  useEffect(() => {
    const restoreAndCalculate = async () => {
      const handleRestoreInputs = async (event: CustomEvent<{ inputs: { basic?: Record<string, string | number>; advanced?: Record<string, string | number | null> } }>) => {
        const { basic, advanced } = event.detail.inputs;
        console.log('Restoring form inputs:', { basic, advanced });
        
        try {
          if (basic) {
            await Promise.all(
              Object.entries(basic).map(async ([key, value]) => {
                console.log(`Setting basic form value: ${key} = ${value}`);
                await basicForm.setValue(key as keyof BasicInputType, String(value));
              })
            );
          }
          
          if (advanced) {
            await Promise.all(
              Object.entries(advanced).map(async ([key, value]) => {
                console.log(`Setting advanced form value: ${key} = ${value}`);
                await advancedForm.setValue(key as keyof AdvancedInputType, value === null ? null : String(value));
              })
            );
          }
          
          // Validate forms before calculation
          const [basicValid, advancedValid] = await Promise.all([
            basicForm.trigger(),
            advancedForm.trigger()
          ]);
          
          if (basicValid && advancedValid) {
            console.log('Forms validated, triggering calculation');
            await handleCalculate();
          } else {
            console.error('Form validation failed after restoration');
          }
        } catch (error) {
          console.error('Error restoring form values:', error);
        }
      };

      // Add event listener for restoring inputs
      window.addEventListener('restoreUserInputs', handleRestoreInputs as EventListener);

      // Check if we have stored inputs in session storage
      const storedInputs = sessionStorage.getItem('userInputs');
      if (storedInputs) {
        try {
          const inputs = JSON.parse(storedInputs);
          console.log('Found stored inputs:', inputs);
          await handleRestoreInputs(new CustomEvent('restoreUserInputs', { detail: { inputs } }));
        } catch (error) {
          console.error('Failed to parse stored inputs:', error);
        }
      }

      return () => {
        window.removeEventListener('restoreUserInputs', handleRestoreInputs as EventListener);
      };
    };

    restoreAndCalculate();
  }, [basicForm, advancedForm]);

  const handleCalculate = async () => {
    setIsCalculating(true);
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

      // Store current form inputs in session storage
      const userInputs = {
        basic: basicData,
        advanced: advancedData
      };
      sessionStorage.setItem('userInputs', JSON.stringify(userInputs));
      console.log('Saved form inputs to sessionStorage:', userInputs);

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
      console.log('Updated results state:', data);
    } catch (error) {
      console.error('Failed to calculate:', error);
      // You might want to show this error to the user with a toast notification
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
        <div>
          <div className="text-center lg:text-left space-y-4 mb-8">
            <h1 className="text-4xl font-bold font-noto-sans">How Much Home Could I Afford.ai</h1>
            <p className="text-muted-foreground"> AI for the biggest purchase of your life.</p>
          </div>

          <Card className="p-6 space-y-6">
            <BasicInputs form={basicForm} />
            <AdvancedInputs form={advancedForm} />
            <Button 
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full max-w-md bg-gradient-to-r from-primary to-primary/90 hover:to-primary relative"
            >
              {isCalculating ? (
                <>
                  <span className="opacity-0">Calculate</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                </>
              ) : (
                'Calculate'
              )}
            </Button>
          </Card>
        </div>

        <div className="lg:pl-8">
          {results ? (
            <div className="space-y-8">
              <AffordabilityResults results={results} />
              <AiChat calculatorData={results} />
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center h-full text-muted-foreground">
              Enter your details and click Calculate to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
