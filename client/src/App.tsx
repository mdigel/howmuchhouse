import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { Header } from "./components/Header";
import "@fontsource/noto-sans/700.css";
import { AffordabilitySkeleton } from './components/ui/affordability-skeleton';

const Home = lazy(() => import('./pages/Home'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Feedback = lazy(() => import('./pages/Feedback'));
const IncomeLevel = lazy(() => import('./pages/IncomeLevel'));
const AffordabilityByState = lazy(() => import('./pages/AffordabilityByState'));

// Check if we're in production mode
const isProduction = import.meta.env.PROD;

function App() {
  // Disable HMR overlay in production
  if (isProduction && typeof window !== 'undefined') {
    // @ts-ignore
    window.viteConfig = {
      server: {
        hmr: {
          overlay: false
        }
      }
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<AffordabilitySkeleton />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/how-it-works" component={HowItWorks} />
            <Route path="/feedback" component={Feedback} />
            <Route path="/affordability-by-income-level" component={IncomeLevel} />
            <Route path="/:income/:state" component={AffordabilityByState} />
            <Route>404 Page Not Found</Route>
          </Switch>
        </Suspense>
      </main>
    </div>
  );
}

export default App;