import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface State {
  id: string;
  abbr: string;
  name: string;
  d: string;
}

interface UsaMapProps {
  selectedIncome: string;
  onStateClick: (stateId: string) => void;
}

export function UsaMap({ selectedIncome, onStateClick }: UsaMapProps) {
  const [, setLocation] = useLocation();

  const handleStateClick = (stateId: string) => {
    onStateClick(stateId);
    setLocation(`/${selectedIncome}/${stateId}`);
  };

  return (
    <div className="w-full aspect-[1.6] relative">
      <svg
        viewBox="0 0 959 593"
        className="w-full h-full"
      >
        <g className="states">
          {states.map((state) => (
            <motion.path
              key={state.id}
              d={state.d}
              className="state-path"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleStateClick(state.id)}
              style={{
                fill: "rgb(229 231 235)",
                stroke: "rgb(255 255 255)",
                strokeWidth: "1",
                cursor: "pointer",
              }}
              whileHover={{
                fill: "rgb(59 130 246)",
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

// We'll need to add the state paths here
const states: State[] = [
  {
    id: "alabama",
    abbr: "AL",
    name: "Alabama",
    d: "M...", // SVG path data for Alabama
  },
  // More states will be added
];