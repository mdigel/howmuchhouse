import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { UsaMap } from "./UsaMap";
import { incomes } from "@/lib/constants";

export function InteractiveAffordability() {
  const [selectedIncome, setSelectedIncome] = useState(incomes[0]);

  const handleSliderChange = (value: number[]) => {
    const income = incomes[value[0]];
    setSelectedIncome(income);
  };

  const handleStateClick = (stateId: string) => {
    console.log(`Selected state: ${stateId} with income: ${selectedIncome}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Income Slider Section */}
        <div className="bg-card shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Select Your Income Level</h2>
          <div className="space-y-6">
            <Slider
              defaultValue={[0]}
              max={incomes.length - 1}
              step={1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-3xl font-bold text-primary">
                ${selectedIncome}
              </span>
              <p className="text-muted-foreground mt-2">
                Annual Income
              </p>
            </div>
          </div>
        </div>

        {/* USA Map Section */}
        <div className="bg-card shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Select Your State</h2>
          <UsaMap 
            selectedIncome={selectedIncome} 
            onStateClick={handleStateClick}
          />
        </div>
      </div>
    </div>
  );
}