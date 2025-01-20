import { loadStripe as loadStripeJs } from "@stripe/stripe-js";

const isProduction = import.meta.env.PROD;
const STRIPE_PUBLISHABLE_KEY = isProduction
  ? process.env.STRIPE_LIVE_PUBLISHABLE_KEY
  : process.env.STRIPE_TEST_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error(`Missing Stripe ${isProduction ? 'live' : 'test'} publishable key - Please check Replit Secrets`);
}

let stripePromise: Promise<any> | null = null;

export const loadStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripeJs(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
