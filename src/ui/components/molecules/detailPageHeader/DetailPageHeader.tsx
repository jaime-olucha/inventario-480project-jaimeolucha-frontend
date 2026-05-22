import { ArrowLeft } from "lucide-react";
import "./DetailPageHeader.scss";

interface DetailPageHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  actions?: React.ReactNode;
}

export const DetailPageHeader = ({ title, subtitle, onBack, actions }: DetailPageHeaderProps) => {
  return (
    <div className="detail-page-header">
      <div className="header-left">
        <button className="btn-back" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>{title}</h1>
          <p className="info">{subtitle}</p>
        </div>
      </div>

      {actions && (
        <div className="header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};
