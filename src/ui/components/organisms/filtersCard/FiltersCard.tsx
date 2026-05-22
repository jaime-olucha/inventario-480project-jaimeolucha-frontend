import { ListFilter, Search } from "lucide-react";
import { FilterSelect } from "@/ui/components/organisms/filterSelect/FilterSelect";
import { STATUS_OPTIONS } from "@/ui/hooks/useFilters";
import { useFiltersCard } from "./useFiltersCard";
import "./FiltersCard.scss";

interface FiltersCardProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  total: number;
  filteredCount: number;
  entityLabel: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  extraFilters?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const FiltersCard = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  total,
  filteredCount,
  entityLabel,
  searchLabel = "Buscar",
  searchPlaceholder = "Escribe para filtrar...",
  extraFilters,
  headerAction,
}: FiltersCardProps) => {
  const { cardRef, scrolled } = useFiltersCard();

  return (
    <article
      ref={cardRef}
      className={`filters-card${scrolled ? " filters-card--scrolled" : ""}`}
    >
      <div className="filters-card__top">
        <h2 className="filters-card__header">
          <ListFilter className="filters-card__icon" />
          Filtros y Búsqueda
        </h2>
        {headerAction && <div className="filters-card__action">{headerAction}</div>}
      </div>
      <div className="filters-card__grid">
        <div className="filter_group">
          <label>{searchLabel}</label>
          <div className="filter_search">
            <Search className="search_icon" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <FilterSelect
          label="Estado"
          value={status}
          options={STATUS_OPTIONS}
          onChange={onStatusChange}
        />
        {extraFilters}
      </div>
      <p className="filters-card__results">
        Mostrando {filteredCount} de {total} {entityLabel}{total !== 1 ? "s" : ""}
      </p>
    </article>
  );
};
