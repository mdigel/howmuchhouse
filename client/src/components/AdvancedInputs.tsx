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
  hoaFees: z.string().transform(Number).default("0"),
  homeownersInsurance: z.string().transform(Number).default("1915"),
  pmiInput: z.string().transform(Number).nullable(),
  propertyTaxInput: z.string().transform(Number).nullable(),
  pretaxContributions: z.string().transform(Number).default("0"),
  dependents: z.string().transform(Number).default("0")
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
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="hoaFees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HOA Fees</FormLabel>
                      <FormControl>
                        <Input placeholder="Monthly HOA fees" {...field} />
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
                        <Input placeholder="Annual insurance cost" {...field} />
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
                        <Input placeholder="Annual PMI" {...field} />
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
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">Update Calculation</Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
