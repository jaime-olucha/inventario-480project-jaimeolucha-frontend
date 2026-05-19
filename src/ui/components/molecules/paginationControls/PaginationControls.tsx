import { ChevronLeft, ChevronRight } from "lucide-react";
import './PaginationControls.scss';

interface Props {
  page: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export const PaginationControls = ({ page, isFirst, isLast, onPrev, onNext }: Props) => (
  <div className="pagination">
    <button className="pagination_btn" onClick={onPrev} disabled={isFirst}>
      <ChevronLeft className="pagination_icon" />
      Anterior
    </button>

    <span className="pagination_page">Página {page}</span>

    <button className="pagination_btn" onClick={onNext} disabled={isLast}>
      Siguiente
      <ChevronRight className="pagination_icon" />
    </button>
  </div>
);
