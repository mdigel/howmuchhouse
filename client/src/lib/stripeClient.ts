import { loadStripe as loadStripeJs } from "@stripe/stripe-js";

const isProduction = import.meta.env.PROD;
const STRIPE_PUBLISHABLE_KEY = isProduction
  ? import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY
  : import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error(`Missing Stripe ${isProduction ? 'live' : 'test'} publishable key - Please check environment variables`);
}

let stripePromise: Promise<any> | null = null;

export const loadStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripeJs(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
