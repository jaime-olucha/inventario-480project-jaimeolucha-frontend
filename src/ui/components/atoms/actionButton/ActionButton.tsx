import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./ActionButton.scss";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  children: ReactNode;
  compact?: boolean;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(({ icon, children, compact = false, className = "", type = "button", ...props }, ref) => {
  return (
    <button ref={ref} type={type} className={`action-button ${compact ? "action-button--compact" : ""} ${className}`.trim()} {...props}>
      {icon && <span className="action-button_icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
});
