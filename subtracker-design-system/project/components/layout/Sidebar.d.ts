import React from "react";

export interface SidebarProps {
  /** @default "/dashboard" */
  activePath?: string;
  /** @default false */
  collapsed?: boolean;
}

export declare function Sidebar(props: SidebarProps): JSX.Element;
