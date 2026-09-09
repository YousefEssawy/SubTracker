import React from "react";

export interface SpaceFormProps {
  space?: { name: string; color: string; icon: string } | null;
  onSubmit?: (data: { name: string; color: string; icon: string }) => void;
  onClose: () => void;
}

export declare function SpaceForm(props: SpaceFormProps): JSX.Element;
