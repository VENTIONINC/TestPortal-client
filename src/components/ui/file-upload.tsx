// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { FileUpload as ChakraFileUpload, Icon, Text } from '@chakra-ui/react';
import { LuUpload } from 'react-icons/lu';

export interface FileUploadRootProps extends ChakraFileUpload.RootProviderProps {
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

export const FileUploadRoot = forwardRef<HTMLInputElement, FileUploadRootProps>(function FileUploadRoot(props, ref) {
  const { children, inputProps, ...rest } = props;

  return (
    <ChakraFileUpload.RootProvider {...rest}>
      <ChakraFileUpload.HiddenInput ref={ref} {...inputProps} />
      {children}
    </ChakraFileUpload.RootProvider>
  );
});

export interface FileUploadDropzoneProps extends ChakraFileUpload.DropzoneProps {
  label: ReactNode;
  description?: ReactNode;
}

export const FileUploadDropzone = forwardRef<HTMLInputElement, FileUploadDropzoneProps>(
  function FileUploadDropzone(props, ref) {
    const { children, label, description, ...rest } = props;

    return (
      <ChakraFileUpload.Dropzone ref={ref} {...rest}>
        <Icon fontSize="xl" color="fg.muted">
          <LuUpload />
        </Icon>
        <ChakraFileUpload.DropzoneContent>
          <div>{label}</div>
          {description && <Text color="fg.muted">{description}</Text>}
        </ChakraFileUpload.DropzoneContent>
        {children}
      </ChakraFileUpload.Dropzone>
    );
  },
);

export const FileUploadLabel = ChakraFileUpload.Label;
export const FileUploadClearTrigger = ChakraFileUpload.ClearTrigger;
export const FileUploadTrigger = ChakraFileUpload.Trigger;
