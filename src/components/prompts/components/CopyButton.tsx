// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { memo, useState, useEffect, useRef } from 'react';
import { Button, IconButton } from '@chakra-ui/react';
import { LuCheck, LuCopy } from 'react-icons/lu';

import { toaster } from '@/components/ui';
import { copyToClipboard } from '@/utils';

interface CopyButtonProps {
  text: string;
  variant?: 'button' | 'icon';
  disabled?: boolean;
}

export const CopyButton = memo(function CopyButton({ text, variant = 'button', disabled }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!text || disabled) return;

    try {
      await copyToClipboard(text);
      setCopied(true);

      toaster.create({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
        type: 'success',
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch {
      toaster.create({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard',
        type: 'error',
      });
    }
  };

  if (variant === 'icon') {
    return (
      <IconButton
        onClick={handleCopy}
        disabled={disabled || !text}
        size="sm"
        variant="ghost"
        aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? <LuCheck color="green" /> : <LuCopy />}
      </IconButton>
    );
  }

  return (
    <Button
      onClick={handleCopy}
      disabled={disabled || !text}
      size="sm"
      colorPalette={copied ? 'green' : 'blue'}
      variant={copied ? 'solid' : 'outline'}
    >
      {copied ? <LuCheck /> : <LuCopy />}
      {copied ? 'Copied!' : 'Copy to Clipboard'}
    </Button>
  );
});
