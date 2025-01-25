import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { Header } from "./components/Header";
import "@fontsource/noto-sans/700.css";
import { AffordabilitySkeleton } from './components/ui/affordability-skeleton';

const Home = React.lazy(() => import('./pages/Home'));
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'));
const Feedback = React.lazy(() => import('./pages/Feedback'));
const IncomeLevel = React.lazy(() => import('./pages/IncomeLevel'));
const AffordabilityByState = React.lazy(() => import('./pages/AffordabilityByState'));

function App() {
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