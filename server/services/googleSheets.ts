import { google } from 'googleapis';
import type { CalculatorResults } from '../../client/src/lib/calculatorTypes';

// Load service account JSON from environment to avoid committing secrets
function loadServiceAccountCredentials(): Record<string, any> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set');
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
}

export async function createGoogleSheet(data: CalculatorResults) {
  const credentials = loadServiceAccountCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ]
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Create a new spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'How Much House Can I Afford.Ai - Analysis',
      },
    },
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId;

  // Filter saving scenarios that exceed max price
  const filteredScenarios = data.savingScenarios.filter(scenario => 
    scenario.mortgagePaymentStats.purchasePrice <= 
    data.maxHomePrice.mortgagePaymentStats.purchasePrice
  );

  // Format headers and data for all scenarios
  const headers = [
    ['File > Make Copy to edit'],
    ['', 'Maximum Home Price', ...filteredScenarios.map(s => s.description)],
    ['Income Summary'],
    ['Gross Income', formatCurrency(data.incomeSummary.grossIncome)],
    ['Net Income', formatCurrency(data.incomeSummary.netIncome)],
    ['Total Tax', formatCurrency(data.incomeSummary.totalTax)],
    [],
    ['Transaction Details'],
    ['Purchase Price', 
      formatCurrency(data.maxHomePrice.mortgagePaymentStats.purchasePrice),
      ...filteredScenarios.map(s => formatCurrency(s.mortgagePaymentStats.purchasePrice))
    ],
    ['Down Payment',
      formatCurrency(data.maxHomePrice.mortgagePaymentStats.downpayment),
      ...filteredScenarios.map(s => formatCurrency(s.mortgagePaymentStats.downpayment))
    ],
    ['Loan Amount',
      formatCurrency(data.maxHomePrice.mortgagePaymentStats.loanAmount),
      ...filteredScenarios.map(s => formatCurrency(s.mortgagePaymentStats.loanAmount))
    ],
    [],
    ['Monthly Payments'],
    ['Total Payment',
      formatCurrency(data.maxHomePrice.mortgagePaymentStats.totalPayment),
      ...filteredScenarios.map(s => formatCurrency(s.mortgagePaymentStats.totalPayment))
    ],
    ['Mortgage Payment',
      formatCurrency(data.maxHomePrice.mortgagePaymentStats.mortgagePayment),
      ...filteredScenarios.map(s => formatCurrency(s.mortgagePaymentStats.mortgagePayment))
    ],
    ['Property Tax',
      formatCurrency(data.maxHomePrice.mortgagePaymentStats.propertyTax),
      ...filteredScenarios.map(s => formatCurrency(s.mortgagePaymentStats.propertyTax))
    ],
    ['PMI',
      formatCurrency(data.maxHomePrice.mortgagePaymentStats.pmi),
      ...filteredScenarios.map(s => formatCurrency(s.mortgagePaymentStats.pmi))
    ],
    ['Home Insurance',
      formatCurrency(data.maxHomePrice.mortgagePaymentStats.homeownersInsurance),
      ...filteredScenarios.map(s => formatCurrency(s.mortgagePaymentStats.homeownersInsurance))
    ],
    ['HOA',
      formatCurrency(data.maxHomePrice.mortgagePaymentStats.hoa),
      ...filteredScenarios.map(s => formatCurrency(s.mortgagePaymentStats.hoa))
    ],
    [],
    ['Monthly Budget Breakdown'],
    ['Monthly Net Income',
      formatCurrency(data.maxHomePrice.scenario.monthlyNetIncome),
      ...filteredScenarios.map(s => formatCurrency(s.scenario.monthlyNetIncome))
    ],
    [],
    ['Budget Percentages'],
    ['Mortgage',
      formatPercentage(data.maxHomePrice.scenario.mortgage.percentage),
      ...filteredScenarios.map(s => formatPercentage(s.scenario.mortgage.percentage))
    ],
    ['Remaining Needs',
      formatPercentage(data.maxHomePrice.scenario.remainingNeeds.percentage),
      ...filteredScenarios.map(s => formatPercentage(s.scenario.remainingNeeds.percentage))
    ],
    ['Wants',
      formatPercentage(data.maxHomePrice.scenario.wants.percentage),
      ...filteredScenarios.map(s => formatPercentage(s.scenario.wants.percentage))
    ],
    ['Savings',
      formatPercentage(data.maxHomePrice.scenario.savings.percentage),
      ...filteredScenarios.map(s => formatPercentage(s.scenario.savings.percentage))
    ],
    [],
    ['Budget Amounts'],
    ['Mortgage',
      formatCurrency(data.maxHomePrice.scenario.mortgage.amount),
      ...filteredScenarios.map(s => formatCurrency(s.scenario.mortgage.amount))
    ],
    ['Remaining Needs',
      formatCurrency(data.maxHomePrice.scenario.remainingNeeds.amount),
      ...filteredScenarios.map(s => formatCurrency(s.scenario.remainingNeeds.amount))
    ],
    ['Wants',
      formatCurrency(data.maxHomePrice.scenario.wants.amount),
      ...filteredScenarios.map(s => formatCurrency(s.scenario.wants.amount))
    ],
    ['Savings',
      formatCurrency(data.maxHomePrice.scenario.savings.amount),
      ...filteredScenarios.map(s => formatCurrency(s.scenario.savings.amount))
    ]
  ];

  // Update the spreadsheet with data
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: headers },
  });

  // Apply formatting for section headers and data
  const requests = [
    // Header row formatting
    {
      repeatCell: {
        range: {
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.66, blue: 0.33 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
            horizontalAlignment: 'CENTER',
            wrapStrategy: 'WRAP'
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,wrapStrategy)',
      },
    },
    // Income Summary section formatting
    {
      repeatCell: {
        range: {
          startRowIndex: 2,
          endRowIndex: 3,
          startColumnIndex: 0,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.85, green: 0.95, blue: 0.85 },
            textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Transaction Details section
    {
      repeatCell: {
        range: {
          startRowIndex: 7,
          endRowIndex: 8,
          startColumnIndex: 0,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.85, green: 0.95, blue: 0.85 },
            textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Bold formatting for specific income fields
    {
      repeatCell: {
        range: {
          startRowIndex: 3,
          endRowIndex: 6,
          startColumnIndex: 0,
          endColumnIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
          },
        },
        fields: 'userEnteredFormat(textFormat)',
      },
    },
    // Monthly Payments section
    {
      repeatCell: {
        range: {
          startRowIndex: 12,
          endRowIndex: 13,
          startColumnIndex: 0,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.85, green: 0.95, blue: 0.85 },
            textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Left column "Monthly Payments" text
    {
      repeatCell: {
        range: {
          startRowIndex: 12,
          endRowIndex: 13,
          startColumnIndex: 0,
          endColumnIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.85, green: 0.95, blue: 0.85 },
            textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Monthly Budget Breakdown section
    {
      repeatCell: {
        range: {
          startRowIndex: 20,
          endRowIndex: 21,
          startColumnIndex: 0,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.85, green: 0.95, blue: 0.85 },
            textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Left column "Monthly Budget Breakdown" text
    {
      repeatCell: {
        range: {
          startRowIndex: 20,
          endRowIndex: 21,
          startColumnIndex: 0,
          endColumnIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.85, green: 0.95, blue: 0.85 },
            textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Budget Percentages section
    {
      repeatCell: {
        range: {
          startRowIndex: 24,
          endRowIndex: 25,
          startColumnIndex: 0,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.85, green: 0.95, blue: 0.85 },
            textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Budget Amounts section
    {
      repeatCell: {
        range: {
          startRowIndex: 30,
          endRowIndex: 31,
          startColumnIndex: 0,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.85, green: 0.95, blue: 0.85 },
            textFormat: { bold: true, foregroundColor: { red: 0, green: 0, blue: 0 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    // Data row formatting
    {
      repeatCell: {
        range: {
          startRowIndex: 8,
          endRowIndex: 11,
          startColumnIndex: 1,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
            horizontalAlignment: 'RIGHT',
            numberFormat: { type: 'CURRENCY', pattern: '$#,##0' },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,horizontalAlignment,numberFormat)',
      },
    },
    // Monthly payment data formatting
    {
      repeatCell: {
        range: {
          startRowIndex: 13,
          endRowIndex: 19,
          startColumnIndex: 1,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
            horizontalAlignment: 'RIGHT',
            numberFormat: { type: 'CURRENCY', pattern: '$#,##0' },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,horizontalAlignment,numberFormat)',
      },
    },
    // Budget percentages formatting
    {
      repeatCell: {
        range: {
          startRowIndex: 25,
          endRowIndex: 29,
          startColumnIndex: 1,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
            horizontalAlignment: 'RIGHT',
            numberFormat: { type: 'PERCENT', pattern: '0.0%' },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,horizontalAlignment,numberFormat)',
      },
    },
    // Budget amounts formatting
    {
      repeatCell: {
        range: {
          startRowIndex: 31,
          endRowIndex: 35,
          startColumnIndex: 1,
          endColumnIndex: data.savingScenarios.length + 2,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
            horizontalAlignment: 'RIGHT',
            numberFormat: { type: 'CURRENCY', pattern: '$#,##0' },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,horizontalAlignment,numberFormat)',
      },
    },
    // Left column labels formatting
    {
      repeatCell: {
        range: {
          startRowIndex: 8,
          endRowIndex: 35,
          startColumnIndex: 0,
          endColumnIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
            horizontalAlignment: 'LEFT',
          },
        },
        fields: 'userEnteredFormat(textFormat,horizontalAlignment)',
      },
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });

  // Make the spreadsheet publicly viewable
  const drive = google.drive({ version: 'v3', auth });
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatPercentage(decimal: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
  }).format(decimal);
}