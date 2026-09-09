import React from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** @default "Are you sure?" */
  title?: string;
  /** @default "This action cannot be undone." */
  message?: string;
  /** @default "Delete" */
  confirmText?: string;
  /** @default "Cancel" */
  cancelText?: string;
  /** @default "danger" */
  variant?: "danger" | "warning";
}

export declare function ConfirmDialog(props: ConfirmDialogProps): JSX.Element;
