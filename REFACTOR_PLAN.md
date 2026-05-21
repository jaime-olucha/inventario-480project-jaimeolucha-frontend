# Plan de Refactorización — Separación Lógica/Vista + Atomización

> **Objetivo:** Separar lógica de vista en custom hooks, atomizar componentes grandes en subcomponentes reutilizables, y eliminar duplicación de patrones entre páginas. El diseño final no cambia en ningún paso.
>
> **Cómo usar este plan:** Díselo a Claude paso a paso. Cada paso es autocontenido. Carga el contexto del paso que toca antes de empezar.

---

## Estado actual de hooks compartidos

| Hook | Ubicación | Estado | Usado en |
|------|-----------|--------|----------|
| `usePagination` | `ui/hooks/usePagination.ts` | ✅ Bien | PersonalPage, ProjectPage, ClientPage |
| `useFilters` | `ui/hooks/useFilters.ts` | ✅ Bien | PersonalPage, ProjectPage, ClientPage |
| `usePersonalFilters` | `ui/hooks/usePersonalFilters.ts` | ✅ Bien | PersonalPage |
| `useModal` | `ui/hooks/useModal.tsx` | ⚠️ Existe pero **nadie lo usa** | — |
| `use-mobile` | `ui/hooks/use-mobile.tsx` | ✅ Bien | — |

---

## Patrones duplicados detectados (a resolver con infraestructura compartida)

### 1. Toast state — duplicado en 8+ componentes
```ts
// Repetido en TODOS los DetailPage y todos los organismos
const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
```
**Solución:** Nuevo hook `useToast`.

### 2. FAB con IntersectionObserver — duplicado en 3 sitios
```ts
// Repetido en PersonalPage (usePersonalPage), ProjectPage, ClientPage
const addBtnRef = useRef<HTMLButtonElement>(null);
const [showFab, setShowFab] = useState(false);
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => setShowFab(!entry.isIntersecting), ...);
  observer.observe(btn); return () => observer.disconnect();
}, []);
```
**Solución:** Nuevo hook `useFab`.

### 3. Toggle-active + Delete con modal de confirmación — duplicado en 3 DetailPages
```ts
// Repetido en PersonalDetailPage, ProjectDetailPage, ClientDetailPage
const [modalActive, setModalActive] = useState<"inactivar" | "activar" | "eliminar" | null>(null);
const [loadingPatch, setLoadingPatch] = useState(false);
const handleToggleActive = async () => { ... patchActive ... }
const handleDelete = async () => { ... deleteEntity ... navigate ... }
```
**Solución:** Nuevo hook `useEntityActions`.

### 4. Lista de proyectos activos/inactivos con expand — duplicado JSX idéntico
```ts
// Misma lógica Y misma vista en PersonalDetailPage y ClientDetailPage
const activeProjects = projects.filter(p => p.isActive);
const inactiveProjects = projects.filter(p => !p.isActive);
const [showAllActive, setShowAllActive] = useState(false);
const PROJECTS_PREVIEW_LIMIT = 2;
// + JSX completamente idéntico
```
**Solución:** Nuevo componente `ProjectsListCard` + hook `useProjectsPreview`.

### 5. `useModal` existe pero nadie lo usa
```ts
// Todos hacen esto en vez de usar useModal:
const [isModalOpen, setIsModalOpen] = useState(false);
```
**Solución:** Adoptar `useModal` en todos los sitios donde corresponda.

---

## FASE 0 — Infraestructura compartida nueva (prerequisito de todo)

> Estas piezas son las que hacen posible la reutilización en las fases siguientes. Deben ir primero.

### Paso 0.1 — Hook `useToast`
- **Archivo nuevo:** `src/ui/hooks/useToast.ts`
- **Qué hace:** encapsula `useState` del toast, expone `toast`, `showToast(msg, type)`, `closeToast`
- **Reemplaza:** el patrón `useState<{message, type} | null>` manual en cada componente
- **Beneficio:** 8+ componentes lo usarán sin duplicar

### Paso 0.2 — Hook `useFab`
- **Archivo nuevo:** `src/ui/hooks/useFab.ts`
- **Qué hace:** encapsula `useRef` + `IntersectionObserver` para el botón FAB, expone `addBtnRef` y `showFab`
- **Reemplaza:** el `useEffect` con IntersectionObserver en `usePersonalPage`, `ProjectPage`, `ClientPage`
- **Nota:** actualizar `usePersonalPage` para consumir `useFab`

### Paso 0.3 — Hook `useEntityActions`
- **Archivo nuevo:** `src/ui/hooks/useEntityActions.ts`
- **Qué hace:** gestiona `modalActive`, `loadingPatch`, `handleToggleActive`, `handleDelete` de forma genérica mediante callbacks
- **Reemplaza:** la triada toggle/delete/loadingPatch duplicada en PersonalDetailPage, ProjectDetailPage, ClientDetailPage
- **Firma sugerida:**
  ```ts
  useEntityActions({
    onToggleActive: async (nextValue: boolean) => void,
    onDelete: async () => void,
    onDeleteSuccess: () => void, // e.g. navigate
  })
  // retorna: { modalActive, setModalActive, loadingPatch, handleToggleActive, handleDelete }
  ```

### Paso 0.4 — Hook `useProjectsPreview`
- **Archivo nuevo:** `src/ui/hooks/useProjectsPreview.ts`
- **Qué hace:** recibe `projects`, separa activos/inactivos, gestiona `showAllActive/showAllInactive`, aplica `PROJECTS_PREVIEW_LIMIT`
- **Reemplaza:** lógica idéntica en PersonalDetailPage y ClientDetailPage
- **Retorna:** `activeProjects`, `inactiveProjects`, `visibleActive`, `visibleInactive`, `showAllActive`, `setShowAllActive`, `showAllInactive`, `setShowAllInactive`

### Paso 0.5 — Componente `ProjectsListCard`
- **Archivo nuevo:** `src/ui/components/organisms/projectsListCard/ProjectsListCard.tsx`
- **Qué hace:** renderiza la tarjeta de proyectos activos/inactivos con expand/collapse
- **Props:** `projects`, `entityLabel` (para el texto "estás asignado" vs "ha participado"), opcionalmente `linkable` (en PersonalDetail los activos tienen Link, en ClientDetail también)
- **Reemplaza:** el bloque JSX `<article className="card projects-card">` duplicado en PersonalDetailPage y ClientDetailPage
- **Usa internamente:** `useProjectsPreview`
- **Diseño:** 100% idéntico al actual, solo extracción

### Paso 0.6 — Componente `DetailPageHeader`
- **Archivo nuevo:** `src/ui/components/molecules/detailPageHeader/DetailPageHeader.tsx`
- **Qué hace:** renderiza la cabecera con botón back + título + subtítulo + slot de acciones (botones inactivar/activar/eliminar)
- **Props:** `title`, `subtitle`, `onBack`, `actions?: ReactNode`
- **Reemplaza:** el bloque `<div className="..._header">` repetido en PersonalDetailPage, ProjectDetailPage, ClientDetailPage
- **Diseño:** exactamente el mismo HTML/CSS, solo extracción

### Paso 0.7 — Adoptar `useModal` donde ya debería usarse
- **Archivos a actualizar:** `ProjectPage.tsx`, `ClientPage.tsx` y los hooks de página que se creen
- **Qué cambia:** `const [isModalOpen, setIsModalOpen] = useState(false)` → `const { isOpen, open, close } = useModal()`
- **Diseño:** sin cambio visible

---

## FASE 1 — `PersonalDetailPage` (prioridad ALTA — 530 líneas, 3 flujos de formulario)

### Paso 1.1 — Hook `usePersonalDetailPage`
- **Archivo nuevo:** `src/ui/pages/Personal/PersonalDetailPage/usePersonalDetailPage.ts`
- **Extrae de `PersonalDetailPage.tsx`:**
  - fetch de `targetUser` y `projects` por `id`
  - estado `isEditing`, `editData`, handlers de edit (`handleEditClick`, `handleSave`, `handleInputChange`, `handleRoleToggle`)
  - estado `isChangingPassword`, `editPassword`, `confirmPassword`, handlers (`handlePasswordInputChange`, `handleCancelPassword`, `handlePasswordSave`)
  - estado `isChangingAdminPassword`, `adminNewPassword`, `adminConfirmPassword`, handlers (`handleCancelAdminPassword`, `handleAdminPasswordSave`)
  - computed: `isAdmin`, `isMyProfile`, `anyModeActive`
- **Usa:** `useEntityActions` (paso 0.3), `useToast` (paso 0.1), `useProjectsPreview` (paso 0.4)
- **`PersonalDetailPage.tsx` resultante:** solo JSX + destructuring del hook

### Paso 1.2 — Componente `UserInfoCard`
- **Archivo nuevo:** `src/ui/components/organisms/userInfoCard/UserInfoCard.tsx`
- **Qué hace:** renderiza el bloque `<article className="card profile-card">` con sus tres modos (vista / editar info / cambiar contraseña / cambiar contraseña admin)
- **Props:** todos los valores y handlers que vienen del hook
- **Usa:** `DetailPageHeader` internamente para los botones de acción de la tarjeta
- **Diseño:** idéntico al actual

### Paso 1.3 — Actualizar `PersonalDetailPage` para usar `ProjectsListCard` y `DetailPageHeader`
- Sustituir el bloque de cabecera por `<DetailPageHeader>` (paso 0.6)
- Sustituir el bloque de proyectos por `<ProjectsListCard>` (paso 0.5)

---

## FASE 2 — `ProjectTeam` organism (prioridad ALTA — 478 líneas, lógica de roles compleja)

### Paso 2.1 — Hook `useProjectTeam`
- **Archivo nuevo:** `src/ui/components/organisms/projectTeam/useProjectTeam.ts`
- **Extrae de `ProjectTeam.tsx`:**
  - fetches: `team`, `users`, `projectRoles`
  - computed: `activeTeam`, `projectManager`, `kam`, `techLeader`, `isAdmin`, `isProjectManager`, `canEdit`, `availableUsers`, `editModeUsers`, `selectedRole`, `filteredTeam`
  - estado: `loading`, `saving`, `error`, `search`, `roleFilter`, `formMeta`, `pendingUserChange`
  - form: `useForm<TeamFormValues>`
  - handlers: `openAddForm`, `openEditForm`, `closeForm`, `findExclusiveRoleOwner`, `persistForm`, `submitForm`, `deactivateMember`, `inactivateMember`, `refreshTeam`
- **Usa:** `useToast` (paso 0.1)
- **`ProjectTeam.tsx` resultante:** solo JSX

### Paso 2.2 — Componente `TeamMemberCard`
- **Archivo nuevo:** `src/ui/components/organisms/projectTeam/TeamMemberCard.tsx`
- **Qué hace:** renderiza el `<article className="team-member">` con su badge de rol y menú de opciones
- **Props:** `member`, `canEdit`, `saving`, `onEdit`, `onInactivate`, `onDeactivate`
- **Reemplaza:** el bloque dentro del `.map` en la lista de equipo

### Paso 2.3 — Componente `RoleSummaryBar`
- **Archivo nuevo:** `src/ui/components/organisms/projectTeam/RoleSummaryBar.tsx`
- **Qué hace:** renderiza las 4 tarjetas de resumen (PM, KAM, Tech Leader, Total)
- **Props:** `projectManager`, `kam`, `techLeader`, `totalCount`
- **Reemplaza:** el bloque `<div className="role-summary">` del JSX

---

## FASE 3 — `ProjectDevelopment` organism (prioridad ALTA — 400 líneas)

### Paso 3.1 — Hook `useProjectDevelopment`
- **Archivo nuevo:** `src/ui/components/organisms/projectDevelopments/useProjectDevelopment.ts`
- **Extrae de `ProjectDevelopment.tsx`:**
  - fetches: `developments`, `technologies` (función `fetchAll`)
  - estado: `loading`, `saving`, `error`, `showForm`, `editingDev`, `devToDelete`, `showTechModal`
  - form: `useForm<DevForm>` con zod schema
  - handlers: `openAddForm`, `openEditForm`, `closeForm`, `handleSubmitForm`, `handleDelete`
- **Usa:** `useToast` (paso 0.1), `useModal` para `showTechModal` y `devToDelete` (paso 0.7)
- **`ProjectDevelopment.tsx` resultante:** solo JSX

### Paso 3.2 — Componente `DevCard`
- **Archivo nuevo:** `src/ui/components/organisms/projectDevelopments/DevCard.tsx`
- **Qué hace:** renderiza el `<article className="dev-card">` con repo, entornos y menú de opciones
- **Props:** `dev`, `canEdit`, `saving`, `onEdit`, `onDelete`
- **Reemplaza:** el bloque dentro del `.map` en el grid de desarrollos

### Paso 3.3 — Componente `DevFormPanel`
- **Archivo nuevo:** `src/ui/components/organisms/projectDevelopments/DevFormPanel.tsx`
- **Qué hace:** renderiza el panel de formulario add/edit con todos sus campos
- **Props:** form register/errors, `editingDev`, `technologies`, `saving`, `onClose`, `onSubmit`
- **Reemplaza:** el bloque `<div className="dev-form-panel">` del JSX

---

## FASE 4 — `ProjectHours` organism (prioridad ALTA)

### Paso 4.1 — Leer `ProjectHours.tsx` y analizar su estado actual
- Antes de actuar: leer el archivo completo para confirmar su lógica

### Paso 4.2 — Hook `useProjectHours`
- **Archivo nuevo:** `src/ui/components/organisms/projectHours/useProjectHours.ts`
- **Extrae:** fetches de time entries y membership, estado de formularios add/edit, permisos `canModify`, cálculo de horas totales, handlers CRUD
- **Usa:** `useToast` (paso 0.1)

### Paso 4.3 — Componente `HoursFormPanel` (si el formulario es suficientemente grande)
- Evaluar tras leer el archivo en 4.1

---

## FASE 5 — `ProjectDetailPage` (prioridad MEDIA)

### Paso 5.1 — Hook `useProjectDetailPage`
- **Archivo nuevo:** `src/ui/pages/Project/ProjectDetailPage/useProjectDetailPage.ts`
- **Extrae de `ProjectDetailPage.tsx`:**
  - fetch de `targetProject` por `id`
  - `activeTab` state
  - computed: `canEdit`, `canDelete`
- **Usa:** `useEntityActions` (paso 0.3), `useToast` (paso 0.1)
- **Nota:** `handleToggleActive` y `handleDelete` pasan a venir de `useEntityActions`

### Paso 5.2 — Usar `DetailPageHeader` en `ProjectDetailPage`
- Sustituir el bloque de cabecera por `<DetailPageHeader>` (paso 0.6)

---

## FASE 6 — `ClientDetailPage` (prioridad MEDIA)

### Paso 6.1 — Hook `useClientDetailPage`
- **Archivo nuevo:** `src/ui/pages/Client/ClientDetailPage/useClientDetailPage.ts`
- **Extrae de `ClientDetailPage.tsx`:**
  - fetch de `projects` por `id`
  - `targetClient` state (se recibe vía callback `onClientLoaded` desde `ClientInfoCard`, mantener ese patrón)
  - computed: `isAdmin`
- **Usa:** `useEntityActions` (paso 0.3), `useToast` (paso 0.1)

### Paso 6.2 — Usar `DetailPageHeader` y `ProjectsListCard` en `ClientDetailPage`
- Sustituir la cabecera por `<DetailPageHeader>` (paso 0.6)
- Sustituir el bloque de proyectos por `<ProjectsListCard>` (paso 0.5)

---

## FASE 7 — `ProjectPage` (prioridad MEDIA-BAJA)

### Paso 7.1 — Hook `useProjectPage`
- **Archivo nuevo:** `src/ui/pages/Project/ProjectPage/useProjectPage.ts`
- **Extrae de `ProjectPage.tsx`:**
  - `projects` state + fetch (por rol admin/employee)
  - modal `isModalOpen` state
  - `handleCreateProject`
- **Usa:** `usePagination` (ya existe), `useFilters` (ya existe), `useFab` (paso 0.2), `useModal` (paso 0.7)
- **`ProjectPage.tsx` resultante:** solo JSX + destructuring

---

## FASE 8 — `ClientPage` (prioridad MEDIA-BAJA)

### Paso 8.1 — Hook `useClientPage`
- **Archivo nuevo:** `src/ui/pages/Client/ClientPage/useClientPage.ts`
- **Extrae de `ClientPage.tsx`:**
  - `clients`, `sectors`, `activeProjectCounts` state + fetches
  - `selectedSectorId` state
  - `handleCreateClient`
  - filtro extra por sector
- **Usa:** `usePagination` (ya existe), `useFilters` (ya existe), `useFab` (paso 0.2), `useModal` (paso 0.7), `useToast` (paso 0.1)

---

## FASE 9 — `ProjectInfo` organism (prioridad MEDIA-BAJA)

### Paso 9.1 — Hook `useProjectInfo`
- **Archivo nuevo:** `src/ui/components/organisms/projectInfo/useProjectInfo.ts`
- **Extrae de `ProjectInfo.tsx`:**
  - fetches: `project`, `clients`
  - estado: `loading`, `editing`, `saving`
  - form: `useForm<EditForm>` con react-hook-form
  - helpers: `startEdit`, `cancelEdit`, `onSubmit`
  - computed: `isAdmin`, `canEdit`, `currentIsActive`
  - utilidades de fecha `formatDate` y `toInputDate` → mover a `src/infrastructure/helpers/formatDate.ts` (si no existen ya)
- **Usa:** `useToast` (paso 0.1)

---

## FASE 10 — `ClientInfoCard` organism (prioridad MEDIA-BAJA)

### Paso 10.1 — Leer `ClientInfoCard.tsx` para confirmar estado actual

### Paso 10.2 — Hook `useClientInfoCard`
- **Archivo nuevo:** `src/ui/components/organisms/clientInfoCard/useClientInfoCard.ts`
- **Extrae:** fetch de client data + sectors, edit mode, form handlers, sector refresh
- **Usa:** `useToast` (paso 0.1) o mantener callback `onToast` si la page padre lo necesita

---

## FASE 11 — `LoginPage` (prioridad BAJA)

### Paso 11.1 — Hook `useLoginPage`
- **Archivo nuevo:** `src/ui/pages/LoginPage/useLoginPage.ts`
- **Extrae de `LoginPage.tsx`:**
  - `sessionMessage` state (con la lectura de `sessionStorage`)
  - `useForm` con zod schema
  - `onSubmit` handler con llamada a `auth.login` y setTokens
- **Usa:** `useToast` (paso 0.1) para el errorToast
- **Nota:** LoginPage es pequeño (69 líneas), el beneficio aquí es principalmente consistencia con el resto del proyecto

---

## Resumen de archivos nuevos a crear

### Hooks compartidos nuevos (`src/ui/hooks/`)
| Archivo | Paso | Descripción |
|---------|------|-------------|
| `useToast.ts` | 0.1 | Centraliza estado y helpers de toast |
| `useFab.ts` | 0.2 | IntersectionObserver para botón FAB |
| `useEntityActions.ts` | 0.3 | Toggle active + delete con modal y loading |
| `useProjectsPreview.ts` | 0.4 | Proyectos activos/inactivos con expand/collapse |

### Componentes compartidos nuevos
| Archivo | Paso | Tipo |
|---------|------|------|
| `organisms/projectsListCard/ProjectsListCard.tsx` | 0.5 | Tarjeta proyectos activos/inactivos |
| `molecules/detailPageHeader/DetailPageHeader.tsx` | 0.6 | Cabecera de páginas de detalle |

### Hooks de página/organismo nuevos
| Archivo | Paso |
|---------|------|
| `pages/Personal/PersonalDetailPage/usePersonalDetailPage.ts` | 1.1 |
| `pages/Project/ProjectDetailPage/useProjectDetailPage.ts` | 5.1 |
| `pages/Client/ClientDetailPage/useClientDetailPage.ts` | 6.1 |
| `pages/Project/ProjectPage/useProjectPage.ts` | 7.1 |
| `pages/Client/ClientPage/useClientPage.ts` | 8.1 |
| `pages/LoginPage/useLoginPage.ts` | 11.1 |
| `organisms/projectTeam/useProjectTeam.ts` | 2.1 |
| `organisms/projectDevelopments/useProjectDevelopment.ts` | 3.1 |
| `organisms/projectHours/useProjectHours.ts` | 4.2 |
| `organisms/projectInfo/useProjectInfo.ts` | 9.1 |
| `organisms/clientInfoCard/useClientInfoCard.ts` | 10.2 |

### Subcomponentes nuevos
| Archivo | Paso | Extraído de |
|---------|------|-------------|
| `organisms/userInfoCard/UserInfoCard.tsx` | 1.2 | PersonalDetailPage |
| `organisms/projectTeam/TeamMemberCard.tsx` | 2.2 | ProjectTeam |
| `organisms/projectTeam/RoleSummaryBar.tsx` | 2.3 | ProjectTeam |
| `organisms/projectDevelopments/DevCard.tsx` | 3.2 | ProjectDevelopment |
| `organisms/projectDevelopments/DevFormPanel.tsx` | 3.3 | ProjectDevelopment |

---

## Reglas de trabajo

1. **Un paso a la vez.** Dile a Claude el número de paso antes de empezar (ej: "Vamos con el paso 0.1").
2. **No tocar CSS/SCSS.** Los class names y el diseño no cambian.
3. **Tipos explícitos.** Todos los hooks deben exportar un tipo de retorno (`ReturnType` o interface nombrada).
4. **Sin lógica en la vista.** Tras cada paso, el componente `.tsx` resultante no debe tener `useEffect`, `useState` directos (solo los que vengan del hook).
5. **Excepción:** `useForm` de react-hook-form puede quedarse en el hook de la página, no en el componente.
