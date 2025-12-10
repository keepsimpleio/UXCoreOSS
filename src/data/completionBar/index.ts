import en from './en';
import ru from './ru';
import hy from '@data/addQuestion/hy';

const locales = {
  en,
  ru,
  hy,
} as const satisfies {
  en: typeof en;
  ru: typeof ru;
  hy: typeof hy;
};

export default locales;
