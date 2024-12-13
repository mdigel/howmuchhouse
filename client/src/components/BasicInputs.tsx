import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BasicInputType } from "@/lib/calculatorTypes";

const basicInputSchema = z.object({
  householdIncome: z.string()
    .min(1, "Income is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Please enter a valid income"),
  downPayment: z.string()
    .min(1, "Down payment is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, "Please enter a valid amount"),
  annualInterestRate: z.string()
    .min(1, "Interest rate is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0 && val < 100, "Please enter a valid interest rate between 0-100"),
  loanTermYears: z.string()
    .transform((val) => Number(val))
    .default("30"),
  state: z.string()
    .min(1, "State is required"),
  filingStatus: z.enum(["single", "married", "head"])
    .default("single")
});

interface BasicInputsProps {
  onSubmit: (data: BasicInputType) => void;
}

export function BasicInputs({ onSubmit }: BasicInputsProps) {
  const form = useForm<z.infer<typeof basicInputSchema>>({
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    placeholder="Enter your annual income" 
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
            name="downPayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Down Payment
                  <span className="text-sm text-muted-foreground">(available for down payment)</span>
                </FormLabel>
                <FormControl>
                  <Input 
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
                    placeholder="Your state (e.g., CA)" 
                    {...field}
                    className="max-w-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full max-w-md bg-gradient-to-r from-primary to-primary/90 hover:to-primary"
        >
          Calculate
        </Button>
      </form>
    </Form>
  );
}
