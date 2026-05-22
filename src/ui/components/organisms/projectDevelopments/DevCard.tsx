import { ExternalLink, GitBranch, LayersIcon, Pencil, Trash2 } from "lucide-react";
import { MenuOptions } from "@/ui/components/organisms/menuOptions/MenuOptions";
import { ENV_ORDER, ENV_LABEL, ENV_CLASS } from "./devEnvironments";
import type { Development } from "@/domain/models/Project/Development";

interface DevCardProps {
  dev: Development;
  canEdit: boolean;
  saving: boolean;
  onEdit: (dev: Development) => void;
  onDelete: (dev: Development) => void;
}

export const DevCard = ({ dev, canEdit, saving, onEdit, onDelete }: DevCardProps) => {
  const linksByEnv = Object.fromEntries(dev.links.map((l) => [l.environment, l.url]));

  return (
    <article className="dev-card">
      <div className="dev-card__header">
        <div className="dev-card__icon">
          <LayersIcon size={20} />
        </div>
        <div className="dev-card__title-area">
          <h3 className="dev-card__name">{dev.name}</h3>
          <span className="tech-badge">{dev.technology.name}</span>
        </div>
        {canEdit && (
          <div className="dev-card__actions">
            <MenuOptions
              disabled={saving}
              items={[
                {
                  label: "Editar",
                  icon: <Pencil size={14} />,
                  onClick: () => onEdit(dev),
                },
                {
                  label: "Eliminar",
                  icon: <Trash2 size={14} />,
                  variant: "danger",
                  onClick: () => onDelete(dev),
                },
              ]}
            />
          </div>
        )}
      </div>

      {dev.description && (
        <p className="dev-card__description">{dev.description}</p>
      )}

      {dev.urlRepository && (
        <a href={dev.urlRepository} target="_blank" rel="noreferrer" className="dev-card__repo">
          <GitBranch size={14} />
          <span className="dev-card__repo-url">{dev.urlRepository}</span>
          <ExternalLink size={12} className="dev-card__repo-icon" />
        </a>
      )}

      <div className="dev-card__envs">
        {ENV_ORDER.map((env) => {
          const url = linksByEnv[env];
          if (!url) return null;
          return (
            <a key={env} href={url} target="_blank" rel="noreferrer" className="dev-card__env-row">
              <span className={`env-badge ${ENV_CLASS[env]}`}>{ENV_LABEL[env]}</span>
              <span className="dev-card__env-url">{url}</span>
              <ExternalLink size={11} className="dev-card__env-icon" />
            </a>
          );
        })}
        {dev.links.length === 0 && (
          <span className="dev-card__no-envs">Sin entornos configurados</span>
        )}
      </div>
    </article>
  );
};
