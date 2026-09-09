import React from "react";

export interface ButtonProps {
  /** @default "primary" */
  variant?: "primary" | "secondary" | "danger";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export declare function Button(props: ButtonProps): JSX.Element;
