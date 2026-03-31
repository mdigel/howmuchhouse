import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  calculateAllScenarios,
} from "../server/calculatorLogic/Orchestrator.js";

type JsonBody = Record<string, any>;

function sendJson(res: VercelResponse, status: number, body: unknown) {
  return res.status(status).json(body);
}

async function readRequestBody(req: VercelRequest): Promise<JsonBody> {
  if (req.body && typeof req.body === "object") {
    return req.body as JsonBody;
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as JsonBody;
  } catch {
    return {};
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || "/", "http://localhost");
  const pathname = url.pathname;
  const isCanaryRequest =
    url.searchParams.get("__canary") === "1" || req.headers["x-canary"] === "1";
  const checkpoint = url.searchParams.get("__checkpoint");

  if (isCanaryRequest) {
    return sendJson(res, 200, {
      ok: true,
      mode: "canary",
      message: "Vercel function executed and loaded direct API handler",
      env: {
        vercel: process.env.VERCEL ?? null,
        nodeEnv: process.env.NODE_ENV ?? null,
      },
    });
  }

  if (checkpoint === "import-server") {
    return sendJson(res, 200, {
      ok: true,
      checkpoint,
      message: "Direct API handler loaded successfully",
    });
  }

  if (checkpoint === "setup-server") {
    return sendJson(res, 200, {
      ok: true,
      checkpoint,
      message: "Direct API handler requires no server setup",
    });
  }

  try {
    if (req.method === "GET" && pathname === "/health") {
      return sendJson(res, 200, { status: "healthy" });
    }

    if (
      req.method === "GET" &&
      (pathname === "/api/current-rate" || pathname === "/current-rate")
    ) {
      const response = await fetch(
        "https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=5e20a3e5e3f4547a87e7f935602f4504&file_type=json&limit=1&sort_order=desc",
      );

      if (!response.ok) {
        throw new Error(`FRED API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.observations || !Array.isArray(data.observations) || data.observations.length === 0) {
        throw new Error("Invalid response structure from FRED API");
      }

      return sendJson(res, 200, data);
    }

    if (
      req.method === "POST" &&
      (pathname === "/api/calculate" || pathname === "/calculate")
    ) {
      const body = await readRequestBody(req);

      const input = {
        householdIncome: Number(body.householdIncome),
        downPayment: Number(body.downPayment),
        monthlyDebt: Number(body.monthlyDebt),
        annualInterestRate: Number(body.annualInterestRate),
        loanTermYears: Number(body.loanTermYears),
        state: body.state,
        filingStatus: body.filingStatus,
        hoaFees: body.hoaFees ? Number(body.hoaFees) : undefined,
        homeownersInsurance: body.homeownersInsurance
          ? Number(body.homeownersInsurance)
          : undefined,
        pmiInput: body.pmiInput ? Number(body.pmiInput) : null,
        propertyTaxInput: body.propertyTaxInput ? Number(body.propertyTaxInput) : null,
        pretaxContributions: body.pretaxContributions
          ? Number(body.pretaxContributions)
          : undefined,
        dependents: body.dependents ? Number(body.dependents) : undefined,
      };

      const requiredNumbers = {
        "Household Income": input.householdIncome,
        "Down Payment": input.downPayment,
        "Monthly Debt": input.monthlyDebt,
        "Annual Interest Rate": input.annualInterestRate,
        "Loan Term Years": input.loanTermYears,
      };

      for (const [field, value] of Object.entries(requiredNumbers)) {
        if (isNaN(value) || value === undefined) {
          throw new Error(`Invalid ${field}: must be a valid number`);
        }
      }

      const results = calculateAllScenarios(input);
      return sendJson(res, 200, results);
    }

    if (req.method === "POST" && pathname === "/api/chat") {
      const body = await readRequestBody(req);
      const { message, calculatorData, isPaid, questionsAsked = 0 } = body;
      const isProduction =
        process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";
      const freeQuestionLimit = 1;
      const isWithinFreeQuestionLimit = Number(questionsAsked) < freeQuestionLimit;
      const effectiveIsPaid =
        process.env.AI_CHARGE_MODE === "true"
          ? Boolean(isPaid) || isWithinFreeQuestionLimit
          : true;

      if (!effectiveIsPaid) {
        return sendJson(res, 402, { error: "Payment required" });
      }

      if (!message || message.length > 3000) {
        return sendJson(res, 400, {
          error: "Message too long",
          message: "Please keep your input under 3000 characters",
        });
      }

      const crypto = await import("crypto");
      const sessionId =
        (req.headers["x-session-id"] as string) || crypto.randomUUID();

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Session-Id", sessionId);

      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const stream = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful real estate and financial advisor assistant.",
          },
          {
            role: "user",
            content: `Financial data:\n${JSON.stringify(calculatorData, null, 2)}\n\nQuestion: ${message}`,
          },
        ],
        model: isProduction ? "gpt-4o-mini" : "gpt-3.5-turbo",
        max_tokens: 500,
        temperature: 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    if (req.method === "POST" && pathname === "/api/create-checkout") {
      const isProduction =
        process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";
      const stripeSecretKey = isProduction
        ? process.env.STRIPE_SECRET_KEY
        : process.env.STRIPE_TEST_SECRET_KEY;

      if (!stripeSecretKey) {
        return sendJson(res, 503, { error: "Stripe is not configured" });
      }

      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2024-12-18.acacia",
        typescript: true,
      });

      const origin = `https://${req.headers.host}`;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AI Chat Access",
                description: "Unlimited access to AI home buying assistant",
              },
              unit_amount: 129,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?canceled=true`,
        allow_promotion_codes: true,
      });

      if (!session.url) {
        throw new Error("Checkout session URL was not generated");
      }

      return sendJson(res, 200, { url: session.url });
    }

    if (req.method === "POST" && pathname === "/api/create-google-sheet") {
      const body = await readRequestBody(req);
      const { createGoogleSheet } = await import("../server/services/googleSheets");
      const sheetUrl = await createGoogleSheet(body.calculatorData);
      return sendJson(res, 200, { url: sheetUrl });
    }

    if (req.method === "POST" && pathname === "/api/feedback") {
      return sendJson(res, 200, { success: true });
    }

    return sendJson(res, 404, { error: "Not found", path: pathname });
  } catch (error) {
    console.error("API handler error:", error);
    return sendJson(res, 500, {
      error: "Request failed",
      message: error instanceof Error ? error.message : "Unknown error",
      path: pathname,
    });
  }
}

