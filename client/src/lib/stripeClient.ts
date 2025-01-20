import { loadStripe as loadStripeJs } from "@stripe/stripe-js";

const isProduction = import.meta.env.PROD || import.meta.env.VITE_REPLIT_DEPLOYMENT === '1';
const STRIPE_PUBLISHABLE_KEY = isProduction
  ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  : import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY;

console.log('Stripe Client Mode:', isProduction ? 'Production' : 'Test');

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
