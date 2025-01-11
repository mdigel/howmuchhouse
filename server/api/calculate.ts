import { Request, Response } from 'express';
import { calculateAffordability } from '../../client/src/lib/calculator';
import type { BasicInputType, AdvancedInputType } from '../../client/src/lib/calculatorTypes';

export async function calculateHandler(req: Request, res: Response) {
  try {
    const {
      householdIncome,
      downPayment,
      monthlyDebt,
      annualInterestRate,
      loanTermYears,
      state,
      filingStatus,
      hoaFees,
      homeownersInsurance,
      pmiInput,
      propertyTaxInput,
      pretaxContributions,
      dependents,
    } = req.body;

    const basicInputs: BasicInputType = {
      householdIncome: householdIncome.toString(),
      downPayment: downPayment.toString(),
      monthlyDebt: monthlyDebt.toString(),
      annualInterestRate: annualInterestRate.toString(),
      loanTermYears: loanTermYears.toString(),
      state,
      filingStatus,
    };

    const advancedInputs: AdvancedInputType = {
      hoaFees: hoaFees?.toString() ?? "0",
      homeownersInsurance: homeownersInsurance?.toString() ?? "1915",
      pmiInput: pmiInput ?? null,
      propertyTaxInput: propertyTaxInput ?? null,
      pretaxContributions: pretaxContributions?.toString() ?? "0",
      dependents: dependents?.toString() ?? "0",
    };

    const results = calculateAffordability(basicInputs, advancedInputs);
    res.json(results);
  } catch (error) {
    console.error('Calculator error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
}

export default calculateHandler;
