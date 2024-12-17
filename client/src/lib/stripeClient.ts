import { loadStripe as loadStripeJs } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe test publishable key - Please check environment variables');
}

let stripePromise: Promise<any> | null = null;

export const loadStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripeJs(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
