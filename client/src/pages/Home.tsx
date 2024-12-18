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

type RestoreInputsEventDetail = {
  inputs: {
    basic?: Partial<BasicInputType>;
    advanced?: Partial<AdvancedInputType>;
  };
};

export default function Home() {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const basicForm = useForm<BasicInputType>({
    resolver: zodResolver(basicInputSchema),
    defaultValues: {
      householdIncome: "",
      downPayment: "",
      annualInterestRate: "",
      loanTermYears: 30,
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

  useEffect(() => {
    const handleRestoreInputs = async (detail: RestoreInputsEventDetail) => {
      const { basic, advanced } = detail.inputs;
      
      try {
        if (basic) {
          for (const [key, value] of Object.entries(basic)) {
            basicForm.setValue(key as keyof BasicInputType, value);
          }
        }
        
        if (advanced) {
          for (const [key, value] of Object.entries(advanced)) {
            advancedForm.setValue(key as keyof AdvancedInputType, value);
          }
        }
        
        const [basicValid, advancedValid] = await Promise.all([
          basicForm.trigger(),
          advancedForm.trigger()
        ]);
        
        if (basicValid && advancedValid) {
          await handleCalculate();
        }
      } catch (error) {
        console.error('Error restoring form values:', error);
      }
    };

    const handleCustomEvent = (event: Event) => {
      if (event instanceof CustomEvent) {
        handleRestoreInputs(event.detail);
      }
    };

    window.addEventListener('restoreUserInputs', handleCustomEvent);

    const storedInputs = sessionStorage.getItem('userInputs');
    if (storedInputs) {
      try {
        const inputs = JSON.parse(storedInputs);
        const event = new CustomEvent('restoreUserInputs', { detail: { inputs } });
        handleCustomEvent(event);
      } catch (error) {
        console.error('Failed to parse stored inputs:', error);
      }
    }

    return () => {
      window.removeEventListener('restoreUserInputs', handleCustomEvent);
    };
  }, [basicForm, advancedForm]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const basicValid = await basicForm.trigger();
      const advancedValid = await advancedForm.trigger();

      if (!basicValid || !advancedValid) {
        return;
      }

      const basicData = basicForm.getValues();
      const advancedData = advancedForm.getValues();

      // Store form state
      const userInputs = {
        basic: basicData,
        advanced: advancedData
      };
      sessionStorage.setItem('userInputs', JSON.stringify(userInputs));

      // Prepare API request data with proper number conversions
      const requestData = {
        ...advancedData,
        householdIncome: parseFloat(basicData.householdIncome as string),
        downPayment: parseFloat(basicData.downPayment as string),
        annualInterestRate: parseFloat(basicData.annualInterestRate as string),
        loanTermYears: basicData.loanTermYears,
        state: basicData.state,
        filingStatus: basicData.filingStatus,
        hoaFees: parseFloat(advancedData.hoaFees as string),
        homeownersInsurance: parseFloat(advancedData.homeownersInsurance as string),
        pretaxContributions: parseFloat(advancedData.pretaxContributions as string),
        dependents: parseInt(advancedData.dependents as string, 10),
      };

      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Calculation failed: ${errorText}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to calculate:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div>
          <div className="text-left space-y-2 mb-8">
            <div className="flex items-center gap-2">
              <h1 className="text-[2rem] leading-8 tracking-tight font-bold font-noto-sans">How Much Home Could I Afford.ai</h1>
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
            <div className="hidden lg:block p-8 bg-card rounded-lg border border-border/50 mt-[6.5rem]">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Let's Find Your Dream Home 🏠</h2>
                <p className="text-muted-foreground">
                  Fill in your details on the left to see:
                </p>
              </div>
              <div className="space-y-4 text-left w-full max-w-md mt-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💰</span>
                  <div>
                    <h3 className="font-medium">Maximum Home Price</h3>
                    <p className="text-sm text-muted-foreground">See the highest home price you can afford</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📊</span>
                  <div>
                    <h3 className="font-medium">Budget Scenarios</h3>
                    <p className="text-sm text-muted-foreground">Explore different saving and spending options</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🤖</span>
                  <div>
                    <h3 className="font-medium">AI-Powered Insights</h3>
                    <p className="text-sm text-muted-foreground">Get personalized recommendations and analysis</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
