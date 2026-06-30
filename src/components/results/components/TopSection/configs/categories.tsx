// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { IoCode } from 'react-icons/io5';
import { IoFlashOutline } from 'react-icons/io5';
import { LuBug } from 'react-icons/lu';
import { IoWarningOutline } from 'react-icons/io5';
import { TbServerCog } from 'react-icons/tb';

import { IssueCategory } from '@/types';

export const CATEGORIES_TYPE = [
  IssueCategory.Bug,
  IssueCategory.Infra,
  IssueCategory.Performance,
  IssueCategory.Script,
  IssueCategory.Other,
] as const;

export const categoriesConfig = {
  [IssueCategory.Bug]: {
    Icon: LuBug,
    color: 'category.categorySecondary.bug.color',
    bg: 'category.categorySecondary.bug.bg',
    textColor: 'category.categorySecondary.text',
    text: 'Bug',
  },
  [IssueCategory.Infra]: {
    color: 'category.categorySecondary.environment.color',
    bg: 'category.categorySecondary.environment.bg',
    Icon: TbServerCog,
    textColor: 'category.categorySecondary.text',
    text: 'Environment',
  },
  [IssueCategory.Performance]: {
    color: 'category.categorySecondary.performance.color',
    bg: 'category.categorySecondary.performance.bg',
    Icon: IoFlashOutline,
    textColor: 'category.categorySecondary.text',
    text: 'Performance',
  },
  [IssueCategory.Script]: {
    color: 'category.categorySecondary.script.color',
    bg: 'category.categorySecondary.script.bg',
    Icon: IoCode,
    textColor: 'category.categorySecondary.text',
    text: 'Script',
  },
  [IssueCategory.Other]: {
    color: 'category.categorySecondary.other.color',
    bg: 'category.categorySecondary.other.bg',
    Icon: IoWarningOutline,
    textColor: 'category.categorySecondary.text',
    text: 'Other',
  },
};
