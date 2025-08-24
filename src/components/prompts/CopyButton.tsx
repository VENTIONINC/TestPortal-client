import { Button, IconButton } from '@chakra-ui/react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import { toaster } from '@/components/ui';

interface CopyButtonProps {
  text: string;
  variant?: 'button' | 'icon';
  disabled?: boolean;
}

export const CopyButton = ({ text, variant = 'button', disabled }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [, copy] = useCopyToClipboard();

  const handleCopy = () => {
    if (!text || disabled) return;

    copy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toaster.create({
      title: 'Copied!',
      description: 'Prompt copied to clipboard',
      type: 'success',
    });
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