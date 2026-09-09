import React from "react";

export interface BadgeProps {
  /** @default "primary" */
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
  children?: React.ReactNode;
  onRemove?: () => void;
}

export declare function Badge(props: BadgeProps): JSX.Element;
