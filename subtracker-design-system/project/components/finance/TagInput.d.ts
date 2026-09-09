import React from "react";

export interface TagInputProps {
  tags?: string[];
  onChange: (tags: string[]) => void;
  /** @default 10 */
  maxTags?: number;
  /** @default 30 */
  maxLength?: number;
}

export declare function TagInput(props: TagInputProps): JSX.Element;
