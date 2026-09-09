import React from "react";

export interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export declare function FileUpload(props: FileUploadProps): JSX.Element;
