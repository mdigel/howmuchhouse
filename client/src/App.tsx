import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import "@fontsource/noto-sans/700.css";

// Disable HMR overlay globally
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.viteConfig = {
    server: {
      hmr: {
        overlay: false,
        // Additional HMR settings to ensure overlay is disabled
        clientPort: 5000,
        timeout: 30000
      }
    }
  };
}

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route>404 Page Not Found</Route>
    </Switch>
  );
}

export default App;