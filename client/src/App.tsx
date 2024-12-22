import { Switch, Route } from "wouter";
import Home from "./pages/Home";
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
    <Switch>
      <Route path="/" component={Home} />
      <Route>404 Page Not Found</Route>
    </Switch>
  );
}

export default App;