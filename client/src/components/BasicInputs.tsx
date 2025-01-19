
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 ml-2 text-muted-foreground hover:text-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="max-w-[280px]">
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
  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="householdIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="flex items-center">
                    Household Income
                    <InfoTooltip text="Total annual income before taxes from all sources in your household" />
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">(per year)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      type="text"
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
                <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="flex items-center">
                    Down Payment
                    <InfoTooltip text="Amount of money you can put towards the purchase of your home. This does not include closing costs." />
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">(available for down payment)</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      type="text"
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
                <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="flex items-center">
                    Monthly Debt
                    <InfoTooltip text="Total monthly payments for car loans, student loans, and other debts. Don't include credit card debt if you pay it off each month." />
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      type="text"
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
                  <InfoTooltip text="Annual interest rate on the mortgage loan" />
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter your interest rate" 
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
