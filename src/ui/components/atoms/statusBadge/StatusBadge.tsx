import { CircleDot } from "lucide-react";
import "./StatusBadge.scss";

interface StatusBadgeProps {
  isActive: boolean;
  onlyInactive?: boolean;
}

export const StatusBadge = ({ isActive, onlyInactive = false }: StatusBadgeProps) => {
  if (onlyInactive && isActive) return null;

  return (
    <span className={`status-badge ${isActive ? "status-badge--active" : "status-badge--inactive"}`}>
      <CircleDot size={12} />
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
};
