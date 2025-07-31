import React from "react";
import "./AnalyticsCard.css";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "orange" | "purple" | "red";
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon,
  color,
}) => {
  return (
    <div className={`analytics-card analytics-card--${color}`}>
      <div className="analytics-card__icon">{icon}</div>
      <div className="analytics-card__content">
        <h3 className="analytics-card__title">{title}</h3>
        <div className="analytics-card__value">{value}</div>
      </div>
    </div>
  );
};

export default AnalyticsCard;
