import React from "react";

export interface RenewalDialProps {
  /** Emoji or short glyph rendered at the dial's center */
  icon: string;
  /** Category color used to tint the center fill */
  iconColor: string;
  /** Days remaining until renewal (negative if past-due) */
  daysUntil: number;
  /** @default "monthly" */
  billingCycle?: "weekly" | "monthly" | "yearly" | "custom";
  customCycleDays?: number | null;
  /** @default 44 */
  size?: number;
}

export declare function RenewalDial(props: RenewalDialProps): JSX.Element;
