// Only configure Vite development features in development mode
if (import.meta.env.DEV) {
  window.viteConfig = {
    server: {
      hmr: {
        overlay: false
      }
    }
  };
}

if (import.meta.env.DEV) {
  console.log('Environment variables:', import.meta.env);
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import App from './App';
import "./index.css";
import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel via env var
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
  debug: import.meta.env.DEV,
  track_pageview: true,
  persistence: 'localStorage',
  ignore_dnt: import.meta.env.DEV, // Only ignore DNT in development mode
  api_host: 'https://api-js.mixpanel.com' // Explicitly set API host
  });
  // Enable automatic event tracking
  mixpanel.set_config({ autocapture: true });
} else if (import.meta.env.DEV) {
  console.warn('VITE_MIXPANEL_TOKEN is not set; telemetry disabled');
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);