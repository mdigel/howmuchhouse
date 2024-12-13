import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { AdvancedInputType } from "@/lib/calculatorTypes";

const advancedInputSchema = z.object({
  hoaFees: z.string()
    .regex(/^\d*\.?\d*$/, "Please enter a valid number")
    .transform(val => val === "" ? "0" : val)
    .transform(Number)
    .default("0"),
  homeownersInsurance: z.string()
    .regex(/^\d*\.?\d*$/, "Please enter a valid number")
    .transform(val => val === "" ? "1915" : val)
    .transform(Number)
    .default("1915"),
  pmiInput: z.string()
    .regex(/^\d*\.?\d*$/, "Please enter a valid number")
    .transform(val => val === "" ? null : Number(val))
    .nullable(),
  propertyTaxInput: z.string()
    .regex(/^\d*\.?\d*$/, "Please enter a valid number")
    .transform(val => val === "" ? null : Number(val))
    .nullable(),
  pretaxContributions: z.string()
    .regex(/^\d*\.?\d*$/, "Please enter a valid number")
    .transform(val => val === "" ? "0" : val)
    .transform(Number)
    .default("0"),
  dependents: z.string()
    .regex(/^\d+$/, "Please enter a whole number")
    .transform(val => val === "" ? "0" : val)
    .transform(Number)
    .default("0")
});

interface AdvancedInputsProps {
  onSubmit: (data: AdvancedInputType) => void;
}

export function AdvancedInputs({ onSubmit }: AdvancedInputsProps) {
  const form = useForm<z.infer<typeof advancedInputSchema>>({
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

  return (
    <Accordion type="single" collapsible className="mt-6">
      <AccordionItem value="advanced">
        <AccordionTrigger>Advanced Inputs</AccordionTrigger>
        <AccordionContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="hoaFees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HOA Fees</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Monthly HOA fees" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homeownersInsurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Homeowners Insurance</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Annual insurance cost" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pmiInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PMI (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Annual PMI" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertyTaxInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Tax (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Annual property tax" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pretaxContributions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pre-tax Contributions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Annual pre-tax contributions" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dependents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Dependents</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Number of dependents"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">Update Calculation</Button>
              </div>

              <Button type="submit">Update Calculation</Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
