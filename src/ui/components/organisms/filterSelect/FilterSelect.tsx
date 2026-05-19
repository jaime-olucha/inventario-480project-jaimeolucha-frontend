import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label ?? '';

  return (
    <div className="filter_group">
      <label>{label}</label>
      <div className="filter_select_wrapper" ref={wrapperRef}>
        <div className="filter_select_trigger" onClick={() => setIsOpen(prev => !prev)}>
          <span>{selectedLabel}</span>
          <ChevronDown className={`chevron_icon${isOpen ? ' open' : ''}`} />
        </div>
        {isOpen && (
          <div className="filter_dropdown">
            {options.map(opt => (
              <div
                key={opt.value}
                className={`filter_option${opt.value === value ? ' selected' : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
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
