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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { AdvancedInputType } from "@/lib/calculatorTypes";

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
        <AccordionContent className="px-2 py-1">
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
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              placeholder="Monthly HOA fees" 
                              {...field}
                              className="pl-7"
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
                    name="homeownersInsurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Homeowners Insurance</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              placeholder="Annual insurance cost" 
                              {...field}
                              className="pl-7"
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
                    name="pmiInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PMI (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              placeholder="Annual PMI" 
                              {...field}
                              className="pl-7"
                              value={field.value ? field.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/,/g, '').replace(/[^\d]/g, '');
                                field.onChange(value === '' ? null : value);
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
                    name="propertyTaxInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Tax (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              placeholder="Annual property tax" 
                              {...field}
                              className="pl-7"
                              value={field.value ? field.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/,/g, '').replace(/[^\d]/g, '');
                                field.onChange(value === '' ? null : value);
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
                    name="pretaxContributions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pre-tax Contributions</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              placeholder="Annual pre-tax contributions" 
                              {...field}
                              className="pl-7"
                              value={field.value ? field.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
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
                    name="dependents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Dependents</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Number of dependents"
                              {...field}
                              className="pl-7 text-sm"
                              style={{ fontSize: '14px' }}
                            />
                          </div>
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