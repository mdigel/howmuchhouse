import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import { Header } from "./components/Header";
import "@fontsource/noto-sans/700.css"; // Import Noto Sans Bold weight

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
        <Switch>
          <Route path="/" component={Home} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;