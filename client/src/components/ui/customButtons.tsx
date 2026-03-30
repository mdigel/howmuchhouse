import type React from "react";
import { Sparkles } from "lucide-react";

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);


interface ButtonProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  variant: "ai" | "sheet";
  onClick: () => void;
  isLoading?: boolean;
}

interface CustomButtonsProps {
  onLaunchAiChat?: () => void;
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
  const isPrimary = variant === "ai";

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        group
        w-full px-4 py-3
        border border-solid rounded-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/50
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isPrimary
          ? 'bg-black text-white hover:bg-[#333333] border-black'
          : 'bg-[#F3F3F3] text-black hover:bg-[#E8E8E8] border-[#E8E8E8]'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          flex-shrink-0
          w-9 h-9
          rounded-lg
          flex items-center justify-center
          ${isPrimary ? 'bg-white/20' : 'bg-white'}
          transition-transform duration-200
          group-hover:scale-105
        `}>
          {isLoading ? (
            <svg
              className={`animate-spin h-4 w-4 ${isPrimary ? 'text-white' : 'text-black'}`}
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
            <div className={isPrimary ? 'text-white' : 'text-black'}>
              {icon}
            </div>
          )}
        </div>
        <div className="text-left flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight">
            {title}
          </div>
          <div className={`text-xs leading-tight mt-0.5 ${isPrimary ? 'text-white/70' : 'text-muted-foreground'}`}>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 max-w-2xl mx-auto">
      {onLaunchAiChat && (
        <CustomButton
          icon={<Sparkles className="h-4 w-4 stroke-current" strokeWidth={2.5} />}
          title="AI Chat"
          subtitle="with your results context"
          variant="ai"
          onClick={onLaunchAiChat}
        />
      )}
      <CustomButton
        icon={<GoogleLogo />}
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
