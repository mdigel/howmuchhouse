import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BasicInputType } from "@/lib/calculatorTypes";

const basicInputSchema = z.object({
  householdIncome: z.string().transform(Number),
  downPayment: z.string().transform(Number),
  annualInterestRate: z.string().transform(Number),
  loanTermYears: z.string().transform(Number),
  state: z.string(),
  filingStatus: z.string()
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
        <h2 className="text-2xl font-semibold">Basic Inputs</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="householdIncome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Household Income</FormLabel>
                <FormControl>
                  <Input placeholder="Annual income" {...field} />
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
                <FormLabel>Down Payment</FormLabel>
                <FormControl>
                  <Input placeholder="Down payment amount" {...field} />
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
                  <Input placeholder="Annual interest rate" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loanTermYears"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Term (Years)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Calculate</Button>
      </form>
    </Form>
  );
}
