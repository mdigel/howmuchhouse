import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BasicInputType } from "@/lib/calculatorTypes";

interface BasicInputsProps {
  form: ReturnType<typeof useForm<BasicInputType>>;
}

export const basicInputSchema = z.object({
  householdIncome: z.number()
    .min(0, "Income must be a positive number")
    .default(0),
  downPayment: z.number()
    .min(0, "Down payment must be a positive number")
    .default(0),
  annualInterestRate: z.number()
    .min(0, "Interest rate must be a positive number")
    .max(100, "Interest rate must be less than 100")
    .default(0),
  loanTermYears: z.number()
    .int()
    .min(1, "Loan term must be at least 1 year")
    .default(30),
  state: z.string()
    .min(1, "State is required")
    .regex(/^[A-Za-z]+$/, "Please enter letters only")
    .length(2, "Please enter a valid 2-letter state code"),
  filingStatus: z.enum(["single", "married", "head"])
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
                <FormLabel className="flex items-center gap-2">
                  Household Income
                  <span className="text-sm text-muted-foreground">(per year)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter your annual income" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="max-w-md"
                  />
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
                <FormLabel className="flex items-center gap-2">
                  Down Payment
                  <span className="text-sm text-muted-foreground">(available for down payment)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter your down payment amount" 
                    {...field}
                    className="max-w-md"
                  />
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
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Current mortgage rate" 
                    {...field}
                    className="max-w-md"
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
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    maxLength={2}
                    placeholder="Your state (e.g., CA)" 
                    {...field}
                    className="max-w-md uppercase"
                    onInput={(e) => {
                      const input = e.currentTarget;
                      input.value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  );
}
