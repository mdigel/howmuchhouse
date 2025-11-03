import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdvancedInputType } from "@/lib/calculatorTypes";

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
            tabIndex={-1}
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

export const advancedInputSchema = z.object({
  loanTermYears: z.string()
    .default("30"),
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
            <div className="space-y-2">
              <div className="grid gap-2">
                <div className="grid gap-2 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="hoaFees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                          <span className="flex items-center h-6 sm:h-auto">
                            HOA Fees
                            <InfoTooltip text="Monthly fees charged by the Homeowner's Association for maintenance and amenities" />
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              inputMode="numeric"
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
                        <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                          <span className="flex items-center h-6 sm:h-auto">
                            Homeowners Insurance
                            <InfoTooltip text="Annual cost of insurance to protect your home and belongings from damage or loss. National average is $1,912" />
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              inputMode="numeric"
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
                        <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                          <span className="flex items-center h-6 sm:h-auto">
                            PMI (Optional)
                            <InfoTooltip text="Private Mortgage Insurance - required when down payment is less than 20% of home value" />
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              inputMode="numeric"
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
                        <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                          <span className="flex items-center h-6 sm:h-auto">
                            Property Tax (Optional)
                            <InfoTooltip text="Annual tax assessed by local government based on your property's value. Can change every few years." />
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              inputMode="numeric"
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
                        <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                          <span className="flex items-center h-6 sm:h-auto">
                            Pre-tax Contributions
                            <InfoTooltip text="Annual contributions to retirement accounts, health savings, or other pre-tax deductions" />
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="text"
                              inputMode="numeric"
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
                    name="loanTermYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                          <span className="flex items-center h-6 sm:h-auto">
                            Loan Term
                            <InfoTooltip text="Length of your mortgage loan term in years" />
                          </span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue="30">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select loan term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 Year</SelectItem>
                            <SelectItem value="20">20 Year</SelectItem>
                            <SelectItem value="30">30 Year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dependents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1">
                          <span className="flex items-center h-6 sm:h-auto">
                            Number of Dependents
                            <InfoTooltip text="Number of qualifying dependents for tax purposes, affecting your tax credits and deductions" />
                          </span>
                        </FormLabel>
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