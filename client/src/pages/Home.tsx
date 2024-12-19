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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
        <div>
          <div className="text-left space-y-2 mb-8">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-[2rem] leading-tight md:leading-8 tracking-tight font-bold font-noto-sans">
                How Much <span className="relative">
                  Home
                  <span className="absolute inset-0 bg-[#006AFF]/20 -rotate-1"></span>
                </span> Could I <span className="relative">
                  Afford.ai
                  <span className="absolute inset-0 bg-[#006AFF]/20 rotate-1"></span>
                </span>
              </h1>
            </div>
            <p className="text-muted-foreground text-base">AI for the biggest purchase of your life.</p>
          </div>

          <Card className="p-6 space-y-6">
            <BasicInputs form={basicForm} />
            <AdvancedInputs form={advancedForm} />
            <Button 
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full max-w-md bg-[#006AFF] hover:bg-[#006AFF]/90 text-white font-semibold py-3 px-6 rounded transition-all duration-300 transform hover:scale-[1.02] relative animate-fade-in"
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
            <div className="hidden lg:flex flex-col gap-6 justify-center h-full p-8">
              <h2 className="text-2xl font-semibold">Let's Find Your Dream Home 🏡</h2>
              <p className="text-muted-foreground mb-6">Fill in your details on the left to see:</p>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💰</span>
                  <div>
                    <h3 className="font-medium">Maximum Home Price</h3>
                    <p className="text-sm text-muted-foreground">See the highest home price you can afford</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📊</span>
                  <div>
                    <h3 className="font-medium">Budget Scenarios</h3>
                    <p className="text-sm text-muted-foreground">Explore different saving and spending options</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤖</span>
                  <div>
                    <h3 className="font-medium">AI Personalized Advisor</h3>
                    <p className="text-sm text-muted-foreground">Get recommendations and analysis for your exact situation</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="mt-12 pb-6 text-center">
        <a 
          href="https://x.com/Elder_Deagle" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span className="text-base">ideas, feedback, bugs</span>
        </a>
      </footer>
    </div>
  );
}