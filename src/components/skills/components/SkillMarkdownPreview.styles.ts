// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import type { SystemStyleObject } from '@chakra-ui/react';

export const skillMarkdownPreviewCss: SystemStyleObject = {
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    color: 'text.main',
    fontWeight: 700,
    lineHeight: 1.25,
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
  },
  '& h1': { fontSize: '2rem', marginTop: 0 },
  '& h2': { fontSize: '1.5rem' },
  '& h3': { fontSize: '1.25rem' },
  '& p, & li': {
    color: 'text.secondary',
    lineHeight: 1.75,
  },
  '& p, & ul, & ol, & table, & blockquote, & pre': {
    marginBottom: '1rem',
  },
  '& ul, & ol': {
    paddingInlineStart: '1.5rem',
  },
  '& li + li': {
    marginTop: '0.35rem',
  },
  '& blockquote': {
    borderInlineStart: '4px solid',
    borderInlineStartColor: 'border.default',
    paddingInlineStart: '1rem',
    color: 'text.secondary',
  },
  '& pre': {
    bg: 'bg.subtle',
    borderRadius: '12px',
    overflowX: 'auto',
    padding: '1rem',
  },
  '& pre code': {
    background: 'transparent',
    borderRadius: 0,
    padding: 0,
  },
  '& code': {
    bg: 'bg.subtle',
    borderRadius: '6px',
    paddingInline: '0.35rem',
    paddingBlock: '0.15rem',
    fontSize: '0.875em',
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    display: 'block',
    overflowX: 'auto',
  },
  '& th, & td': {
    border: '1px solid',
    borderColor: 'border.default',
    padding: '0.75rem',
    textAlign: 'left',
    minWidth: '120px',
  },
  '& th': {
    bg: 'bg.subtle',
    color: 'text.main',
    fontWeight: 600,
  },
  '& hr': {
    borderColor: 'border.default',
    marginBlock: '1.5rem',
  },
};
