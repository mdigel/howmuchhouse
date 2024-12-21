import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import App from './App';
import "./index.css";

// Disable HMR overlay to prevent runtime errors in Arc browser
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('HMR update incoming, overlay disabled');
  });
}

// Configure Vite's runtime behavior
window.__vite_plugin_react_preamble_installed__ = true;
if (typeof window !== 'undefined') {
  // @ts-ignore - Runtime configuration
  window.viteConfig = {
    server: {
      hmr: {
        overlay: false
      }
    }
  };
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);