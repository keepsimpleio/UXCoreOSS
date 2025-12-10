import type { StrapiBiasType, TagType } from '@local-types/data';
import { UserTypes } from '@local-types/uxcat-types/types';

export interface UXCoreLayoutProps {
  tags: TagType[];
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
  setOpenPersonas?: (openPersonas: boolean) => void;
  uxcatUserInfo?: UserTypes;
  setUxcatUserInfo?: (data: UserTypes) => void;
  blockLanguageSwitcher?: boolean;
  slug?: string;
}
