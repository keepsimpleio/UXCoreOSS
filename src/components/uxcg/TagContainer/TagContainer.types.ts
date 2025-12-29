import { TitlesType } from '@local-types/data';

export type TagContainerProps = {
  id: number;
  title: TitlesType;
  backgroundUrl?: string;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  activeFilter?: string;
  iconName?: string;
  resultTags?: string[];
  setStageName?: (stageName: TitlesType) => void;
  locale?: string;
};
