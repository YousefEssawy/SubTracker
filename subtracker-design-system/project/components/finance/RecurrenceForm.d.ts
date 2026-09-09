import React from "react";

export interface RecurrenceFormProps {
  spaces?: { id: string; name: string; icon: string }[];
  categories?: { id: string; name: string }[];
  onClose: () => void;
  onSubmit?: () => void;
}

export declare function RecurrenceForm(props: RecurrenceFormProps): JSX.Element;
