import { Check, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { useClickOutside } from "@/ui/hooks/useClickOutside";
import "./FilterSelect.scss";

type Option = { value: string; label: string };

interface FilterSelectProps {
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
}

export const FilterSelect = ({ label, value, options, onChange }: FilterSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside(wrapperRef, () => setIsOpen(false));

  const selectedLabel = options.find(o => o.value === value)?.label ?? '';

  return (
    <div className="filter_group">
      <label>{label}</label>
      <div className="filter_select_wrapper" ref={wrapperRef}>
        <div
          role="button"
          tabIndex={0}
          className="filter_select_trigger"
          onClick={() => setIsOpen(prev => !prev)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(prev => !prev); } }}
        >
          <span>{selectedLabel}</span>
          <ChevronDown className={`chevron_icon${isOpen ? ' open' : ''}`} />
        </div>
        {isOpen && (
          <div role="listbox" className="filter_dropdown">
            {options.map(opt => (
              <div
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                tabIndex={0}
                className={`filter_option${opt.value === value ? ' selected' : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(opt.value); setIsOpen(false); } }}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check className="check_icon" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
