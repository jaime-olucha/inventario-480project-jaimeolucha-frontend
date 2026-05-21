import { Crown, KeyRound, Code2, Users2 } from "lucide-react";
import { getFullName } from "./useProjectTeam";
import type { ProjectUser } from "@/domain/models/Project/ProjectUser";

interface RoleSummaryBarProps {
  projectManager: ProjectUser | undefined;
  kam: ProjectUser | undefined;
  techLeader: ProjectUser | undefined;
  totalCount: number;
}

const ROLE_CARDS = [
  { label: "Project Manager", key: "pm" as const, icon: <Crown size={20} />, cls: "summary-card--pm" },
  { label: "KAM",             key: "kam" as const, icon: <KeyRound size={20} />, cls: "summary-card--kam" },
  { label: "Tech Leader",     key: "tech" as const, icon: <Code2 size={20} />, cls: "summary-card--tech" },
] as const;

export const RoleSummaryBar = ({ projectManager, kam, techLeader, totalCount }: RoleSummaryBarProps) => {
  const memberByKey: Record<typeof ROLE_CARDS[number]["key"], ProjectUser | undefined> = {
    pm: projectManager,
    kam,
    tech: techLeader,
  };

  return (
    <div className="role-summary">
      {ROLE_CARDS.map(({ label, key, icon, cls }) => (
        <article key={label} className={`summary-card ${cls}`}>
          <div className="summary-icon">{icon}</div>
          <div className="summary-info">
            <span>{label}</span>
            <strong>{memberByKey[key] ? getFullName(memberByKey[key]!) : "Sin asignar"}</strong>
          </div>
        </article>
      ))}

      <article className="summary-card">
        <div className="summary-icon">
          <Users2 size={20} />
        </div>
        <div>
          <span>Total personal</span>
          <strong>{totalCount}</strong>
        </div>
      </article>
    </div>
  );
};
