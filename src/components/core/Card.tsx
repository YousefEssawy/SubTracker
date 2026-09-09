import type { CSSProperties, ReactNode } from "react";

export interface CardProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** @default "20px" */
  padding?: string;
}

const Card = ({ children, className = "", style, padding = "20px" }: CardProps) => {
  return (
    <div className={`glass-card ${className}`.trim()} style={{ padding, ...style }}>
      {children}
    </div>
  );
};

export default Card;
