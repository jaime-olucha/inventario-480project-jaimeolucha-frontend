import { Link } from "react-router-dom";
import { ROUTES } from "@/ui/routes/routes";
import { CalendarDays, Clock, Mail, Plus, SquareArrowRightEnter, User } from 'lucide-react';
import './DashboardPage.scss';
import { LogoUser } from "@/ui/components/atoms/logoUser/LogoUser";
import { useDashboardPage } from "./useDashboardPage";
import { SectionHeader } from "@/ui/components/molecules/sectionHeader/SectionHeader";


export const DashboardPage = () => {

  const { user: userStore, roleBadge, projects, weeklyHours, maxHours, totalHours, projectColorMap, errors, isSubmittingHours, handleSubmitHours, register } = useDashboardPage()

  return (
    <section className="dashboard-page">
      <SectionHeader
        title={`¡Bienvenid@, ${userStore?.name}!`}
        description={`Gestiona tus proyectos y horas de trabajo`}
      />

      <article className="card profile_card">
        <div className="card_logo">
          <h2 className="card_header">Tu Perfil</h2>
          <LogoUser user={userStore ?? undefined} className="logo-user" />
        </div>
        <div className="card-user_info">
          <p><User className="iconSvg" /><strong>Name:</strong> {userStore?.name} {userStore?.surname}</p>
          <p><Mail className="iconSvg" /><strong>Correo:</strong> {userStore?.email}</p>
        </div>
        {roleBadge && <span className="card_badge--dashboard">{roleBadge}</span>}
      </article>

      <article className="card">
        <div className="projects-header">
          <div>
            <h2 className="card_header">Tus Proyectos</h2>
            <p className="info">Proyectos en los que estas asignado</p>
          </div>
          <Link to={ROUTES.PROJECTS.LIST} className="btn-see-all">Ver Todos</Link>
        </div>
        <div className="card_container">
          {projects.length === 0 ? (
            <p>No tienes proyectos asignados</p>
          ) : (
            <ul className="projects-list">
              {projects.slice(0, 4).map((project) => (
                <li className="li-map" key={project.id}>
                  <Link to={ROUTES.PROJECTS.BY_ID(project.id)}>
                    <div className="card">
                      <div className="project-info">
                        <h2 className="card_header">{project.name}</h2>
                        <p className="info">{project.description}</p>
                        <p className="info team-members"><User className="iconSvg" />{project.teamMembers} Miembros</p>
                        <span className="iconSvg icon-into_project"><SquareArrowRightEnter /></span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      <article className="card">
        <div className="hours-header">
          <div>
            <h2 className="card_header">Horas Imputadas esta semana</h2>
            <p className="info">Imputa horas a tus proyectos asignados</p>
          </div>
          <span className="total-hours-stat">{totalHours}h</span>
        </div>

        <form className="time-entry-form" onSubmit={handleSubmitHours}>
          <div className="form-group">
            <label htmlFor="time-entry-project">Proyecto</label>
            <select id="time-entry-project" disabled={projects.length === 0 || isSubmittingHours} {...register("projectId")}>
              {projects.length === 0 ? (
                <option value="">No tienes proyectos asignados</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))
              )}
            </select>
            {errors.projectId && <p className="time-entry-error">{errors.projectId.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="time-entry-date">Fecha</label>
            <div className="input-with-icon">
              <CalendarDays size={16} />
              <input id="time-entry-date" type="date" disabled={isSubmittingHours} {...register("date")} />
            </div>
            {errors.date && <p className="time-entry-error">{errors.date.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="time-entry-hours">Horas</label>
            <div className="input-with-icon">
              <Clock size={16} />
              <input id="time-entry-hours" type="number" min="0.25" step="0.25" placeholder="Ej. 7.5" disabled={isSubmittingHours} {...register("hours")} />
            </div>
            {errors.hours && <p className="time-entry-error">{errors.hours.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="time-entry-comment">Comentario</label>
            <input id="time-entry-comment" type="text" placeholder="Ej. Revisión de PRs" disabled={isSubmittingHours} {...register("comment")} />
          </div>

          <button className="btn-submit-hours" type="submit" disabled={projects.length === 0 || isSubmittingHours}>
            <Plus size={14} />
            {isSubmittingHours ? "Imputando..." : "Imputar"}
          </button>
        </form>

        <div className="weekly-hours">
          {weeklyHours.map((day) => {
            let cumulativeBottomPct = 0;
            return (
              <div className={`day-column ${day.total === 0 ? "is-empty" : ""}`} key={day.day}>
                <span className="day-hours">{day.total > 0 ? `${day.total}h` : "—"}</span>
                <div className="day-bar-wrapper">
                  <div className="day-bar">
                    {day.entries.map((entry) => {
                      const heightPct = (entry.hours / maxHours) * 100;
                      const bottomPct = cumulativeBottomPct;
                      cumulativeBottomPct += heightPct;
                      return (
                        <div
                          key={entry.projectId}
                          className="day-bar_segment"
                          style={{
                            height: `${heightPct}%`,
                            bottom: `${bottomPct}%`,
                            backgroundColor: projectColorMap.get(entry.projectId) ?? "#00b341",
                          }}
                        />
                      );
                    })}
                  </div>
                  {day.total > 0 && (
                    <div className="day-tooltip">
                      {day.entries.map((entry) => (
                        <div key={entry.projectId} className="day-tooltip_entry">
                          <span
                            className="day-tooltip_dot"
                            style={{ backgroundColor: projectColorMap.get(entry.projectId) ?? "#00b341" }}
                          />
                          <span className="day-tooltip_name">{entry.projectName}</span>
                          <strong>{entry.hours}h</strong>
                        </div>
                      ))}
                      {day.entries.length > 1 && (
                        <div className="day-tooltip_total">Total: <strong>{day.total}h</strong></div>
                      )}
                    </div>
                  )}
                </div>
                <span className="day-label">{day.day}</span>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
};
