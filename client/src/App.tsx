import { Switch, Route } from "wouter";
import Home from "./pages/Home";
import "@fontsource/noto-sans/700.css"; // Import Noto Sans Bold weight

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route>404 Page Not Found</Route>
    </Switch>
  );
}

export default App;
