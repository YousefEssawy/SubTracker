import React from "react";

export interface AuthShellProps {
  /** @default "login" */
  variant?: "login" | "signup";
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export declare function AuthShell(props: AuthShellProps): JSX.Element;
