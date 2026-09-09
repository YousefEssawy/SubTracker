import React from "react";

export interface HeaderProps {
  pageTitle?: string;
  /** @default "light" */
  theme?: "light" | "dark";
  onMenuToggle?: () => void;
  onToggleTheme?: () => void;
  /** @default true */
  hasNotifications?: boolean;
  /** Override the logo image path (defaults to the design system's own relative asset path) */
  logoSrc?: string;
}

export declare function Header(props: HeaderProps): JSX.Element;
