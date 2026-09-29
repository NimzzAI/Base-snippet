"use client";
import { useState, useRef, useEffect } from "react";

export type OptionItem = {
  value: string;
  label: string;
  icon?: string;
  dotColor?: string;
};

interface CustomSelectProps {
  label?: string;
  value: string;
  options: OptionItem[] | string[];
  onChange: (value: string) => void;
  icon?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CustomSelect({
  label,
  value,
  options,
  onChange,
  icon,
  placeholder = "Pilih...",
  className = "",
  style,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options
  const normalizedOptions: OptionItem[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`filter-dropdown ${isOpen ? "is-open" : ""} ${className}`}
      style={style}
    >
      <button
        type="button"
        className="filter-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon && <i className={`fa-solid ${icon}`} />}
        {label && <span className="filter-label">{label}:</span>}
        <span className="filter-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className="fa-solid fa-chevron-down caret" />
      </button>

      {isOpen && (
        <div className="filter-panel" role="listbox">
          {label && (
            <div className="filter-panel-head">
              <i className={icon ? `fa-solid ${icon}` : "fa-solid fa-list"} />
              <span>{label}</span>
            </div>
          )}
          <div className="filter-list">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  className={`filter-item ${isSelected ? "is-selected" : ""}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.dotColor && (
                    <span
                      className="filter-item-dot"
                      style={{ background: opt.dotColor }}
                    />
                  )}
                  {opt.icon && (
                    <span className="filter-item-icon">
                      <i className={opt.icon.startsWith("fa-") ? `fa-solid ${opt.icon}` : opt.icon} />
                    </span>
                  )}
                  <span className="filter-item-label">{opt.label}</span>
                  <i className="fa-solid fa-check filter-item-check" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
