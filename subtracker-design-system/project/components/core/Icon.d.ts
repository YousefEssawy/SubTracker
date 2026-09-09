import React from "react";

export interface IconProps {
  /** Heroicons v2 outline glyph name, e.g. "bell", "arrow-path", "x-mark" */
  name: string;
  /** @default 20 */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export declare function Icon(props: IconProps): JSX.Element;
