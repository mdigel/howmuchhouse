import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { BasicInputType } from "@/lib/calculatorTypes";

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

interface BasicInputsProps {
  form: ReturnType<typeof useForm<BasicInputType>>;
}

const US_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const basicInputSchema = z.object({
  householdIncome: z.string()
    .min(1, "Income is required")
    .regex(/^[0-9]*$/, "Please enter numbers only")
    .refine((val) => val === "" || Number(val) > 0, "Please enter positive numbers only"),
  downPayment: z.string()
    .min(1, "Down payment is required")
    .regex(/^[0-9]*$/, "Please enter numbers only")
    .refine((val) => val === "" || Number(val) >= 0, "Please enter positive numbers only"),
  monthlyDebt: z.string()
    .min(1, "Monthly debt is required")
    .regex(/^[0-9]*$/, "Please enter numbers only")
    .refine((val) => val === "" || Number(val) >= 0, "Please enter positive numbers only"),
  annualInterestRate: z.string()
    .min(1, "Interest rate is required")
    .regex(/^\d*\.?\d*$/, "Please enter a valid number")
    .refine((val) => val === "" || (Number(val) > 0 && Number(val) < 100), "Please enter a valid interest rate between 0-100"),
  loanTermYears: z.string()
    .regex(/^[0-9]+$/, "Please enter a valid number")
    .transform(val => val === "" ? "30" : val)
    .default("30"),
  state: z.string()
    .min(1, "State is required")
    .regex(/^[A-Za-z]+$/, "Please enter letters only")
    .length(2, "Please enter a valid 2-letter state code")
    .refine(
      (val) => val === "" || US_STATE_CODES.includes(val.toUpperCase()),
      "Please enter a valid US state code"
    ),
  filingStatus: z.enum(["single", "married"])
    .default("single")
});

export function BasicInputs({ form }: BasicInputsProps) {
  const [defaultInterestRate, setDefaultInterestRate] = useState("6.00");
  const [interestRateTooltip, setInterestRateTooltip] = useState("Annual interest rate on the mortgage loan");

  useEffect(() => {
    fetch('https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=5e20a3e5e3f4547a87e7f935602f4504&file_type=json&limit=1&sort_order=desc')
      .then(response => response.json())
      .then(data => {
        if (data.observations && data.observations[0]?.value) {
          const rate = data.observations[0].value;
          const date = data.observations[0].date;
          setDefaultInterestRate(rate);
          setInterestRateTooltip(`Based on FRED (Federal Reserve Economic Data) national average for 30-year fixed mortgage as of ${date}: ${rate}%`);
          form.setValue('annualInterestRate', rate);
        }
      })
      .catch(() => {
        setInterestRateTooltip("Failed to fetch current rates. Using 6% as a general 2025 estimate");
      });
  }, []);

  return (
    <Form {...form}>
      <div className="space-y-2 sm:space-y-2">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="householdIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                  <span className="flex items-center h-6 sm:h-auto">
                    Household Income
                    <InfoTooltip text="Total annual income before taxes from all sources in your household" />
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground -mt-2 sm:mt-0 pt-1 pb-2">(per year)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter your annual income" 
                      {...field}
                      className="max-w-md pl-7"
                      value={field.value ? field.value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '').replace(/[^\d]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="downPayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                  <span className="flex items-center h-6 sm:h-auto">
                    Down Payment
                    <InfoTooltip text="Amount of money you can put towards the purchase of your home. This does not include closing costs." />
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground -mt-2 sm:mt-0 pt-1 pb-2">(available for down payment)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter your down payment amount" 
                      {...field}
                      className="max-w-md pl-7"
                      value={field.value ? field.value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '').replace(/[^\d]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyDebt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                  <span className="flex items-center h-6 sm:h-auto">
                    Monthly Debt
                    <InfoTooltip text="Total monthly payments for car loans, student loans, and other debts. Don't include credit card debt if you pay it off each month." />
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground -mt-2 sm:mt-0"></span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter your total monthly debt" 
                      {...field}
                      className="max-w-md pl-7"
                      value={field.value ? field.value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '').replace(/[^\d]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="annualInterestRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Interest Rate (%)
                  <InfoTooltip text={interestRateTooltip} />
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder={`Current rate: ${defaultInterestRate}%`} 
                    {...field}
                    className="max-w-md text-sm"
                    style={{ fontSize: '14px' }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  State
                  <InfoTooltip text="Your state of residence (2-letter code)" />
                </FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    maxLength={2}
                    placeholder="Enter your state code" 
                    {...field}
                    className="max-w-md text-sm"
                    style={{ fontSize: '14px' }}
                    onInput={(e) => {
                      const input = e.currentTarget;
                      input.value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase();
                      if (input.value.length === 2) {
                        form.trigger('state');
                      }
                    }}
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value.length === 2) {
                        form.trigger('state');
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="filingStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Filing Status
                  <InfoTooltip text="Your tax filing status (single or married filing jointly)" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue="single">
                  <FormControl>
                    <SelectTrigger className="max-w-md text-sm">
                      <SelectValue placeholder="Select filing status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  );
}