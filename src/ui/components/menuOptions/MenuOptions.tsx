import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import "./MenuOptions.scss";

export interface MenuOptionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "warning";
  disabled?: boolean;
}

interface MenuOptionsProps {
  items: MenuOptionItem[];
  disabled?: boolean;
}

export const MenuOptions = ({ items, disabled = false }: MenuOptionsProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleItemClick = (item: MenuOptionItem) => {
    if (item.disabled) return;
    setOpen(false);
    item.onClick();
  };

  return (
    <div className="menu-options" ref={containerRef}>
      <button
        type="button"
        className="menu-options__trigger"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        aria-label="Más opciones"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <ul className="menu-options__dropdown" role="menu">
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                className={`menu-options__item ${item.variant ? `menu-options__item--${item.variant}` : ""}`}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
              >
                {item.icon && <span className="menu-options__item-icon">{item.icon}</span>}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
