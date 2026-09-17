// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { IoCode } from 'react-icons/io5';
import { IoFlashOutline } from 'react-icons/io5';
import { LuBug } from 'react-icons/lu';
import { IoWarningOutline } from 'react-icons/io5';
import { TbServerCog } from 'react-icons/tb';

import { ResultCategory } from '@/types';

export const CATEGORIES_TYPE = [
  ResultCategory.Bug,
  ResultCategory.Infra,
  ResultCategory.Performance,
  ResultCategory.Script,
  ResultCategory.Other,
] as const;

export const categoriesConfig = {
  [ResultCategory.Bug]: {
    Icon: LuBug,
    color: 'category.categorySecondary.bug.color',
    bg: 'category.categorySecondary.bug.bg',
    textColor: 'category.categorySecondary.text',
    text: 'Bug',
  },
  [ResultCategory.Infra]: {
    color: 'category.categorySecondary.environment.color',
    bg: 'category.categorySecondary.environment.bg',
    Icon: TbServerCog,
    textColor: 'category.categorySecondary.text',
    text: 'Environment',
  },
  [ResultCategory.Performance]: {
    color: 'category.categorySecondary.performance.color',
    bg: 'category.categorySecondary.performance.bg',
    Icon: IoFlashOutline,
    textColor: 'category.categorySecondary.text',
    text: 'Performance',
  },
  [ResultCategory.Script]: {
    color: 'category.categorySecondary.script.color',
    bg: 'category.categorySecondary.script.bg',
    Icon: IoCode,
    textColor: 'category.categorySecondary.text',
    text: 'Script',
  },
  [ResultCategory.Other]: {
    color: 'category.categorySecondary.other.color',
    bg: 'category.categorySecondary.other.bg',
    Icon: IoWarningOutline,
    textColor: 'category.categorySecondary.text',
    text: 'Other',
  },
};
