import { useState, useEffect } from "react";
import mixpanel from 'mixpanel-browser';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BasicInputs, basicInputSchema } from "@/components/BasicInputs";
import { AdvancedInputs, advancedInputSchema } from "@/components/AdvancedInputs";
import { AffordabilityResults } from "@/components/AffordabilityResults";
import { AiChat } from "@/components/AiChat";
import { TextMeListings } from "@/components/TextMeListings";
import { RealEstateAgents } from "@/components/RealEstateAgents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { BasicInputType, AdvancedInputType, CalculatorResults } from "@/lib/calculatorTypes";
import { CONFIG } from "@/config";

export default function Home() {
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showTextListings, setShowTextListings] = useState(false);
  const [showRealEstateAgents, setShowRealEstateAgents] = useState(false);

  const basicForm = useForm<BasicInputType>({
    resolver: zodResolver(basicInputSchema),
    defaultValues: {
      householdIncome: "",
      downPayment: "",
      monthlyDebt: "",
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
    const handleTextListings = () => {
      setShowAiChat(false);
      setShowTextListings(true);
      setShowRealEstateAgents(false);
    };

    window.addEventListener('showTextListings', handleTextListings);
    return () => {
      window.removeEventListener('showTextListings', handleTextListings);
    };
  }, []);

  useEffect(() => {
    const restoreAndCalculate = async () => {
      const handleRestoreInputs = async (event: CustomEvent<{ inputs: { basic?: Record<string, string | number>; advanced?: Record<string, string | number | null> } }>) => {
        const { basic, advanced } = event.detail.inputs;
        if (import.meta.env.DEV) {
          console.log('Restoring form inputs:', { basic, advanced });
        }

        try {
          if (basic) {
            await Promise.all(
              Object.entries(basic).map(async ([key, value]) => {
                if (import.meta.env.DEV) {
                  console.log(`Setting basic form value: ${key} = ${value}`);
                }
                await basicForm.setValue(key as keyof BasicInputType, String(value));
              })
            );
          }

          if (advanced) {
            await Promise.all(
              Object.entries(advanced).map(async ([key, value]) => {
                if (import.meta.env.DEV) {
                  console.log(`Setting advanced form value: ${key} = ${value}`);
                }
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
            if (import.meta.env.DEV) {
              console.log('Forms validated, triggering calculation');
            }
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
          if (import.meta.env.DEV) {
            console.log('Found stored inputs:', inputs);
          }
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
    
    // Track calculation event with form data
    mixpanel.track('Calculator Used', {
      householdIncome: basicForm.getValues('householdIncome'),
      downPayment: basicForm.getValues('downPayment'),
      monthlyDebt: basicForm.getValues('monthlyDebt'),
      state: basicForm.getValues('state'),
      filingStatus: basicForm.getValues('filingStatus'),
      interestRate: basicForm.getValues('annualInterestRate'),
    });
    try {
      const basicValid = await basicForm.trigger();
      const advancedValid = await advancedForm.trigger();

      if (import.meta.env.DEV) {
        console.log('Form validation results:', { basicValid, advancedValid });
        console.log('Form errors:', basicForm.formState.errors, advancedForm.formState.errors);
      }

      if (!basicValid || !advancedValid) {
        if (import.meta.env.DEV) {
          console.log('Form validation failed');
        }
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
      if (import.meta.env.DEV) {
        console.log('Saved form inputs to sessionStorage:', userInputs);
      }

      if (import.meta.env.DEV) {
        console.log('Sending calculation request with data:', { ...basicData, ...advancedData });
      }

      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...basicData,
          ...advancedData,
          // Ensure numbers are properly parsed
          householdIncome: Number(basicData.householdIncome),
          downPayment: Number(basicData.downPayment),
          monthlyDebt: Number(basicData.monthlyDebt),
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
      if (import.meta.env.DEV) {
        console.log('Received calculation results:', data);
        console.log('Updated results state:', data);
      }
      setResults(data);
      setShowAiChat(false); // Reset AI chat visibility when new results are calculated
    } catch (error) {
      console.error('Failed to calculate:', error);
      // You might want to show this error to the user with a toast notification
    } finally {
      setIsCalculating(false);
      // Auto scroll to results on mobile and tablet views
      if (window.innerWidth < 1024) {
        // Wait for results to be rendered
        setTimeout(() => {
          const resultsElement = document.querySelector('.AffordabilityResults');
          if (resultsElement) {
            const headerOffset = 20;
            const elementPosition = resultsElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
        <div>
          <Card className="p-6 space-y-6 bg-white border-[#E8E8E8]">
            <BasicInputs form={basicForm} />
            <AdvancedInputs form={advancedForm} />
            <div className="space-y-3">
              <div className="relative w-full group animate-fade-in isolate">
                <div
                  className="absolute inset-0 -z-10 rounded-lg transition-opacity duration-200 group-hover:opacity-80"
                  style={{
                    background: 'linear-gradient(135deg, rgba(128, 0, 255, 0.4), rgba(0, 128, 255, 0.4), rgba(0, 255, 255, 0.4), rgba(0, 255, 128, 0.4), rgba(200, 255, 0, 0.4))',
                    filter: 'blur(20px)',
                    transform: 'scale(1.1)',
                    opacity: 0.6,
                  }}
                />
                <button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="relative z-0 w-full px-6 py-3 border border-border rounded-lg text-foreground text-sm font-semibold hover:bg-gray-50 hover:-translate-y-0.5 transition-all bg-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isCalculating ? (
                    <>
                      <span className="opacity-0">Calculate</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span>Calculate</span>
                      <span className="relative inline-block w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <line
                            x1="3" y1="8" x2="9" y2="8"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                            className="transition-all duration-300 ease-out scale-x-0 group-hover:scale-x-100"
                            style={{ transformOrigin: '9px 8px' }}
                          />
                          <path
                            d="M9 4L13 8L9 12"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </>
                  )}
                </button>
              </div>
              <Link href="/why" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it works?
              </Link>
            </div>
          </Card>
        </div>

        <div className="lg:pl-8 lg:flex lg:flex-col">
          {results ? (
            <div className="lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
              <AffordabilityResults 
                results={results} 
                showAiChat={showAiChat}
                onLaunchAiChat={CONFIG.AI_CHAT_ENABLED ? () => {
                  setShowAiChat(true);
                  setShowTextListings(false);
                  setShowRealEstateAgents(false);
                } : undefined}
              />
            </div>
          ) : (
            <div className="hidden lg:flex flex-col gap-8 justify-center h-full p-8">
              <h2 className="text-3xl font-bold tracking-tight text-black">Find what you can afford</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F3F3F3] flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">$</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Maximum Home Price</h3>
                    <p className="text-sm text-muted-foreground">See the highest price the bank will likely allow</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F3F3F3] flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">%</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Comfortable Home Prices</h3>
                    <p className="text-sm text-muted-foreground">Purchase & save a significant portion of your income</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F3F3F3] flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">AI</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">AI Personalized Advisor</h3>
                    <p className="text-sm text-muted-foreground">Get analysis for your exact situation</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {CONFIG.AI_CHAT_ENABLED && results && showAiChat && (
        <div className="max-w-7xl mx-auto mt-8">
          <AiChat calculatorData={results} />
        </div>
      )}
      {results && (
        <div className="max-w-7xl mx-auto mt-8">
          {showTextListings && <TextMeListings />}
          {showRealEstateAgents && <RealEstateAgents />}
        </div>
      )}
      <footer className="mt-36 md:mt-48 pb-6 text-center space-y-4">
        <div className="w-full max-w-2xl mx-auto border-t border-border pt-6" />
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} A Plymouth Holding Production</p>
          <p className="text-xs">Talk to a human before making a huge financial decision.</p>
        </div>
      </footer>
    </div>
  );
}