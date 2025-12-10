import en from './en';
import ru from './ru';
import hy from './hy';

interface TUsefulLinkType {
  title: string;
  link: string;
  icon: string;
  alt?: string;
  target: string;
  download: boolean;
}

interface TUsefulLinks {
  title: string;
  items: TUsefulLinkType[];
}

interface TToolHeaderData {
  usefulLinksLabel: string;
  usernameIsTaken: string;
  settingsTxt: string;
  myProfileTxt: string;
  bobName: string;
  awarenessTest: string;
  usefulLinks: TUsefulLinks[];
  podcast: string;
  findSolutions: string;
  learnAboutUXCore: string;
}

export default { en, ru, hy } as {
  en: TToolHeaderData;
  ru: TToolHeaderData;
  hy: TToolHeaderData;
};
