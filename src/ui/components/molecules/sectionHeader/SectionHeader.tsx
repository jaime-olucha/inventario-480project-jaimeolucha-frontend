import React from "react";
import "./SectionHeader.scss";

interface SectionHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const SectionHeader = ({ title, description, action }: SectionHeaderProps) => {
  return (
    <header className="section-header">
      <div className="section-header--info">
        <h1 className="section-header--title">{title}</h1>
        <p className="section-header--description">{description}</p>
      </div>

      {action && (
        <div className="section-header__action">
          {action}
        </div>
      )}
    </header>
  );
};
