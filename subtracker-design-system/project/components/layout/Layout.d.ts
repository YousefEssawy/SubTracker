import React from "react";

export interface LayoutProps {
  pageTitle?: string;
  activePath?: string;
  children?: React.ReactNode;
}

export declare function Layout(props: LayoutProps): JSX.Element;
