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
