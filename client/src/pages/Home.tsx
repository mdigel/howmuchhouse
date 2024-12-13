import { useState } from "react";
import { BasicInputs } from "@/components/BasicInputs";
import { AdvancedInputs } from "@/components/AdvancedInputs";
import { AffordabilityResults } from "@/components/AffordabilityResults";
import { AiChat } from "@/components/AiChat";
import { Card } from "@/components/ui/card";
import type { BasicInputType, AdvancedInputType, CalculatorResults } from "@/lib/calculatorTypes";

export default function Home() {
  const [basicInputs, setBasicInputs] = useState<BasicInputType | null>(null);
  const [advancedInputs, setAdvancedInputs] = useState<AdvancedInputType | null>(null);
  const [results, setResults] = useState<CalculatorResults | null>(null);

  const handleCalculate = async (basic: BasicInputType, advanced: AdvancedInputType) => {
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...basic, ...advanced })
      });
      
      if (!response.ok) throw new Error('Calculation failed');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to calculate:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">HowMuchHouseCanIAfford.ai</h1>
          <p className="text-muted-foreground">The smartest AI for the biggest purchase of your life</p>
        </div>

        <Card className="p-6">
          <BasicInputs 
            onSubmit={(inputs) => {
              setBasicInputs(inputs);
              if (advancedInputs) {
                handleCalculate(inputs, advancedInputs);
              }
            }} 
          />

          <AdvancedInputs
            onSubmit={(inputs) => {
              setAdvancedInputs(inputs);
              if (basicInputs) {
                handleCalculate(basicInputs, inputs);
              }
            }}
          />
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
