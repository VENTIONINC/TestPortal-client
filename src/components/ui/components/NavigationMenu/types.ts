// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { IconType } from 'react-icons';

export interface NavigationMenuItem {
  id: string;
  label: string;
  icon: IconType;
  path?: string;
  active?: boolean;
}

export interface NavigationMenuGroup {
  id: string;
  title?: string;
  items: NavigationMenuItem[];
}
