import type React from "react";
import { Sparkles, FileSpreadsheet } from "lucide-react";

interface ButtonProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  variant: "ai" | "sheet";
  onClick: () => void;
  isLoading?: boolean;
}

interface CustomButtonsProps {
  onLaunchAiChat: () => void;
  onGoogleSheet?: () => void;
  isCreatingSheet?: boolean;
}

const CustomButton: React.FC<ButtonProps> = ({
  icon,
  title,
  subtitle,
  variant,
  onClick,
  isLoading,
}) => {
  const variantStyles = {
    ai: {
      container: "bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50/60 border-blue-200/60 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconColor: "text-white",
      titleColor: "text-gray-900",
      subtitleColor: "text-gray-600",
    },
    sheet: {
      container: "bg-gradient-to-br from-emerald-50 via-green-50/80 to-teal-50/60 border-emerald-200/60 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      iconColor: "text-white",
      titleColor: "text-gray-900",
      subtitleColor: "text-gray-600",
    },
  };

  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        group
        w-full px-4 py-2.5 
        bg-white/80 backdrop-blur-sm
        border border-solid rounded-xl
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transform transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-0.5
        active:scale-[0.98] active:translate-y-0
        disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
        ${styles.container}
        ${variant === 'ai' ? 'focus:ring-blue-500/50' : 'focus:ring-emerald-500/50'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          flex-shrink-0 
          w-9 h-9 
          rounded-lg 
          flex items-center justify-center
          ${styles.iconBg}
          shadow-md
          transition-transform duration-300
          group-hover:scale-110
        `}>
          {isLoading ? (
            <svg 
              className="animate-spin h-4 w-4 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <div className={styles.iconColor}>
              {icon}
            </div>
          )}
        </div>
        <div className="text-left flex-1 min-w-0">
          <div className={`font-semibold text-sm leading-tight ${styles.titleColor}`}>
            {title}
          </div>
          <div className={`text-xs leading-tight mt-0.5 ${styles.subtitleColor}`}>
            {subtitle}
          </div>
        </div>
      </div>
    </button>
  );
};

const CustomButtons: React.FC<CustomButtonsProps> = ({
  onLaunchAiChat,
  onGoogleSheet,
  isCreatingSheet,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 max-w-2xl mx-auto">
      <CustomButton
        icon={<Sparkles className="h-4 w-4 stroke-current" strokeWidth={2.5} />}
        title="AI Chat"
        subtitle="with your results context"
        variant="ai"
        onClick={onLaunchAiChat}
      />
      <CustomButton
        icon={<FileSpreadsheet className="h-4 w-4 stroke-current" strokeWidth={2.5} />}
        title="Open Google Sheet"
        subtitle="with your results data"
        variant="sheet"
        onClick={onGoogleSheet || (() => {})}
        isLoading={isCreatingSheet}
      />
    </div>
  );
};

export default CustomButtons;