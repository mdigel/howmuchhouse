import { loadStripe as loadStripeJs } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('Missing Stripe publishable key');
}

let stripePromise: Promise<any> | null = null;

export const loadStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripeJs(STRIPE_PUBLISHABLE_KEY);
  }
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }
  return stripe;
};
