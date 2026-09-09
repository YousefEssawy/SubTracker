import React from "react";

export interface CardProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  /** @default "20px" */
  padding?: string;
}

export declare function Card(props: CardProps): JSX.Element;
