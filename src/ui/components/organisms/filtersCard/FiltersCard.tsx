import { useEffect, useRef, useState } from "react";
import { ListFilter, Search } from "lucide-react";
import { FilterSelect } from "@/ui/components/molecules/filterSelect/FilterSelect";
import { STATUS_OPTIONS } from "@/ui/hooks/useFilters";
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

function getScrollParent(el: HTMLElement): HTMLElement {
  let node = el.parentElement;
  while (node) {
    const { overflow, overflowY } = window.getComputedStyle(node);
    if (/auto|scroll/.test(overflow + overflowY)) return node;
    node = node.parentElement;
  }
  return document.documentElement;
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
  const cardRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    const parent = getScrollParent(cardRef.current);
    let raf: number;
    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(parent.scrollTop > 80));
    };
    parent.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      parent.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <article
      ref={cardRef}
      className={`filters-card${scrolled ? ' filters-card--scrolled' : ''}`}
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
              onChange={e => onSearchChange(e.target.value)}
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
        Mostrando {filteredCount} de {total} {entityLabel}{total !== 1 ? 's' : ''}
      </p>
    </article>
  );
};
