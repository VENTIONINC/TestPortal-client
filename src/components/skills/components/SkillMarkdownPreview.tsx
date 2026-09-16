// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { MarkdownPreview } from '@/components/ui';

interface SkillMarkdownPreviewProps {
  content: string;
}

export const SkillMarkdownPreview = ({ content }: SkillMarkdownPreviewProps) => <MarkdownPreview content={content} />;
