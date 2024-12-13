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

export const advancedInputSchema = z.object({
  hoaFees: z.string()
    .regex(/^[0-9]*\.?[0-9]*$/, "Please enter a valid number")
    .transform(val => val === "" ? "0" : val)
    .transform(Number)
    .refine((val) => val >= 0, "Please enter positive numbers only")
    .default("0"),
  homeownersInsurance: z.string()
    .regex(/^[0-9]*\.?[0-9]*$/, "Please enter a valid number")
    .transform(val => val === "" ? "1915" : val)
    .transform(Number)
    .refine((val) => val >= 0, "Please enter positive numbers only")
    .default("1915"),
  pmiInput: z.string()
    .regex(/^[0-9]*\.?[0-9]*$/, "Please enter a valid number")
    .transform(val => val === "" ? null : Number(val))
    .refine((val) => val === null || val >= 0, "Please enter positive numbers only")
    .nullable(),
  propertyTaxInput: z.string()
    .regex(/^[0-9]*\.?[0-9]*$/, "Please enter a valid number")
    .transform(val => val === "" ? null : Number(val))
    .refine((val) => val === null || val >= 0, "Please enter positive numbers only")
    .nullable(),
  pretaxContributions: z.string()
    .regex(/^[0-9]*\.?[0-9]*$/, "Please enter a valid number")
    .transform(val => val === "" ? "0" : val)
    .transform(Number)
    .refine((val) => val >= 0, "Please enter positive numbers only")
    .default("0"),
  dependents: z.string()
    .regex(/^[0-9]+$/, "Please enter a whole number")
    .transform(val => val === "" ? "0" : val)
    .transform(Number)
    .refine((val) => val >= 0, "Please enter positive numbers only")
    .default("0")
});

export function AdvancedInputs({ form }: { form: ReturnType<typeof useForm<AdvancedInputType>> }) {
  return (
    <Accordion type="single" collapsible className="mt-6">
      <AccordionItem value="advanced">
        <AccordionTrigger>Advanced Inputs</AccordionTrigger>
        <AccordionContent>
          <Form {...form}>
            <div className="space-y-6">
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
                            value={field.value ?? ''}
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
                            value={field.value ?? ''}
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
              </div>
            </div>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
