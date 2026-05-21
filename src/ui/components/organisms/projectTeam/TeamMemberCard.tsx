import { Pencil, UserX, Trash2 } from "lucide-react";
import { PROJECT_ROLES, getProjectRoleLabel } from "@/domain/value-objects/ProjectRole";
import { LogoUser } from "@/ui/components/atoms/logoUser/LogoUser";
import { MenuOptions } from "@/ui/components/organisms/menuOptions/MenuOptions";
import { getFullName } from "./useProjectTeam";
import type { ProjectUser } from "@/domain/models/Project/ProjectUser";

interface TeamMemberCardProps {
  member: ProjectUser;
  canEdit: boolean;
  saving: boolean;
  onEdit: (member: ProjectUser) => void;
  onInactivate: (member: ProjectUser) => void;
  onDeactivate: (member: ProjectUser) => void;
}

export const TeamMemberCard = ({ member, canEdit, saving, onEdit, onInactivate, onDeactivate }: TeamMemberCardProps) => {
  const isPm = member.role.name === PROJECT_ROLES.PROJECT_MANAGER;
  const isKam = member.role.name === PROJECT_ROLES.KAM;
  const isTechLead = member.role.name === PROJECT_ROLES.TECH_LEADER;

  return (
    <article className="team-member">
      <div className="member-main">
        <LogoUser user={member} className="avatar" />
        <div>
          <h3>{getFullName(member)}</h3>
        </div>
      </div>

      <div className="member-side">
        <span className={`role-badge ${isPm ? "role-badge--pm" : ""} ${isKam ? "role-badge--kam" : ""} ${isTechLead ? "role-badge--tech" : ""}`}>
          {getProjectRoleLabel(member.role.name)}
        </span>

        {canEdit && (
          <div className="member-actions">
            <MenuOptions
              disabled={saving}
              items={[
                {
                  label: "Editar",
                  icon: <Pencil size={14} />,
                  onClick: () => onEdit(member),
                },
                {
                  label: "Inactivar del proyecto",
                  icon: <UserX size={14} />,
                  variant: "warning",
                  onClick: () => onInactivate(member),
                },
                {
                  label: "Eliminar",
                  icon: <Trash2 size={14} />,
                  variant: "danger",
                  onClick: () => onDeactivate(member),
                },
              ]}
            />
          </div>
        )}
      </div>
    </article>
  );
};
