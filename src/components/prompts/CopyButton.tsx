import { Button, IconButton } from '@chakra-ui/react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { useState } from 'react';

import { toaster } from '@/components/ui';
import { copyToClipboard } from '@/utils';

interface CopyButtonProps {
  text: string;
  variant?: 'button' | 'icon';
  disabled?: boolean;
}

export const CopyButton = ({ text, variant = 'button', disabled }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

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
};
