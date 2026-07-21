// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router';

import type { SkillMetadata } from '@/redux/apis/generatedApi';
import { useDialogActions } from '@/redux/slices/dialog';
import { PATHS } from '@/types/paths';

import { DeleteSkillDialog } from './delete-skill-dialog';
import { SkillPackageDialog } from './skill-package-dialog';

export const useCreateSkillDialog = () => {
  const { openDialog } = useDialogActions();

  return () => openDialog(SkillPackageDialog, { mode: 'create' as const });
};

export const useReplaceSkillDialog = () => {
  const { openDialog } = useDialogActions();

  return (skill: SkillMetadata) => openDialog(SkillPackageDialog, { mode: 'replace' as const, skill });
};

export const useDeleteSkillDialog = () => {
  const { openDialog } = useDialogActions();
  const navigate = useNavigate();

  return (skill: SkillMetadata) =>
    openDialog(DeleteSkillDialog, {
      skillId: skill.id,
      skillTitle: skill.title,
      onDeleted: () => navigate(PATHS.SKILLS),
    });
};
