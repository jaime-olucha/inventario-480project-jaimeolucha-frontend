import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { getRoleBadge } from "@/infrastructure/helpers/getRoleBadge";
import { ProjectsCounter } from "@/ui/components/molecules/projectsCounter/ProjectsCounter";
import { CreatePersonalModal } from "./CreatePersonalModal";
import { FiltersCard } from "@/ui/components/organisms/filtersCard/FiltersCard";
import { FilterSelect } from "@/ui/components/organisms/filterSelect/FilterSelect";
import { usePersonalFilters, ROLE_OPTIONS } from "@/ui/hooks/usePersonalFilters";
import { PaginationControls } from "@/ui/components/molecules/paginationControls/PaginationControls";
import './PersonalPage.scss';
import { LogoUser } from "@/ui/components/atoms/logoUser/LogoUser";
import { StatusBadge } from "@/ui/components/atoms/statusBadge/StatusBadge";
import { ROUTES } from "@/ui/routes/routes";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { SectionHeader } from "@/ui/components/molecules/sectionHeader/SectionHeader";
import { useModal } from "@/ui/hooks/useModal";
import { useFab } from "@/ui/hooks/useFab";
import { usePersonalPage } from "./usePersonalPage";


export const PersonalPage = () => {
  const { activeProjectCounts, isFirst, isLast, page, users, goNext, goPrev, handleCreateUser } = usePersonalPage();
  const { search, setSearch, status, setStatus, role, setRole, filteredUsers } = usePersonalFilters(users);
  const { isOpen, open, close } = useModal();
  const { btnRef, showFab } = useFab();

  return (
    <section className="section-page">
      <SectionHeader
        title="Personal"
        description="Gestiona el personal de la empresa"
        action={
          <ActionButton ref={btnRef} icon={<UserPlus size={20} />} onClick={open}>
            Nuevo Personal
          </ActionButton>
        }
      />

      {isOpen && (
        <CreatePersonalModal
          onClose={close}
          onSubmit={handleCreateUser}
          existingEmails={users.map((user) => user.email)}
        />
      )}

      <FiltersCard
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        total={users.length}
        filteredCount={filteredUsers.length}
        entityLabel="persona"
        searchLabel="Buscar persona"
        searchPlaceholder="Nombre o apellido..."
        extraFilters={
          <FilterSelect label="Tipo de acceso" value={role} options={ROLE_OPTIONS} onChange={setRole} />
        }
      />

      <ul className="user-list">
        {filteredUsers.map((user) => (
          <li className="li-map" key={user.id}>
            <Link to={ROUTES.USER.BY_ID(user.id)}>
              <article className={`card card_user ${!user.isActive ? 'user_disabled' : ''}`}>
                <div>
                  <LogoUser user={user} className="logo-user" />
                </div>
                <div className="card-user_info">
                  <h2 className="card-user_label">
                    {user.name} {user.surname} {getRoleBadge(user.role) && <span className="card_badge--personal">{getRoleBadge(user.role)}</span>}
                    <StatusBadge isActive={user.isActive} onlyInactive />
                  </h2>
                  <p className="info"><strong>Correo: </strong>{user.email}</p>
                </div>
                <ProjectsCounter count={activeProjectCounts[user.id] ?? 0} />
              </article>
            </Link>
          </li>
        ))}
      </ul>

      <PaginationControls page={page} isFirst={isFirst} isLast={isLast} onPrev={goPrev} onNext={goNext} />

      {showFab && (
        <ActionButton className="action-button--fab" icon={<UserPlus size={20} />} onClick={open}>
          <span className="sr-only">Nuevo Personal</span>
        </ActionButton>
      )}
    </section>
  );
};

