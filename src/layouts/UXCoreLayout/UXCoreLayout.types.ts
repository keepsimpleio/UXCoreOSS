import type { StrapiBiasType } from '@local-types/data';
import { UserTypes } from '@local-types/uxcat-types/types';

export interface UXCoreLayoutProps {
  mounted?: boolean;
  strapiBiases: StrapiBiasType[];
  isOpen?: boolean;
  biasSelected?: boolean;
  openPodcast?: boolean;
  setOpenPodcast?: {
    (updater: (prev: boolean) => boolean): void;
    (value: boolean): void;
  };
  userInfo?: UserTypes;
  setUserInfo?: (data: UserTypes) => void;
  blockLanguageSwitcher?: boolean;
}
