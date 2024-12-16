import { loadStripe as loadStripeJs } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<any> | null = null;

export const loadStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripeJs(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
