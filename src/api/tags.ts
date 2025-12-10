import type { TagType } from '@local-types/data';

const tags = [
  {
    id: 1,
    styles: { backgroundColor: '#5396D3' },
    title: {
      en: 'Team',
      ru: 'Команда',
      hy: 'Թիմ',
    },
    tooltip: {
      en: 'Questions related to in-house team members cooperation (product, development teams and others).',
      ru: 'Вопросы связанные с кооперацией команд и лиц, работающих над продуктом.',
      hy: 'Հարցեր ներքին թիմային համագործակցության մասին (պրոդուկտի թիմի, տեխնիկական թիմի և այլ բաժինների միջև)։',
    },
  },
  {
    id: 2,
    styles: { backgroundColor: '#77A34B' },
    title: {
      en: 'Development',
      ru: 'Разработка',
      hy: 'Մշակում',
    },
    tooltip: {
      en: 'Questions related to product development stage (from concept to first public release).',
      ru: 'Вопросы связанные со стадией разработки продукта (от идеи до публичного релиза).',
      hy: 'Հարցեր պրոդուկտի մշակման փուլերի մասին (սկսած գաղափարից մինչև առաջին հանրային թողարկում)։',
    },
  },
  {
    id: 3,
    styles: { backgroundColor: '#A36AA4' },
    title: {
      en: 'Pre-SignUp',
      ru: 'Предрегистрация',
      hy: 'Մինչ գրանցում',
    },
    tooltip: {
      en: 'Questions related to sales, marketing funnels, prospects and leads communication, and overall product packaging.',
      ru: 'Вопросы связанные с продажами, маркетингом, потенциальными пользователями и общей оберткой продукта.',
      hy: 'Հարցեր վաճառքների, մարքեթինգի, պոտենցիալ հաճախորդների հետ հաղորդակցության և ընդհանուր առմամբ պրոդուկտի փաթեթավորման մասին։',
    },
  },
  {
    id: 4,
    styles: { backgroundColor: '#D3666D' },
    title: {
      en: 'Post-SignUp',
      ru: 'Пост-регистрация',
      hy: 'Գրանցումից հետո',
    },
    tooltip: {
      en: 'Questions related to user interaction with actual product and its features.',
      ru: 'Вопросы связанные с интеракцией пользователей с продуктом и его функционалом.',
      hy: 'Հարցեր իրական պրոդուկտի և նրա ֆունկցիոնալության օգտագործման մասին։',
    },
  },
  {
    id: 5,
    styles: { backgroundColor: '#E19F3B' },
    title: {
      en: 'Analytics',
      ru: 'Аналитика',
      hy: 'Վերլուծություն',
    },
    tooltip: {
      en: 'Questions related to product analytical data analysis.',
      ru: 'Вопросы связанные с чтением аналитики по продукту.',
      hy: 'Պրոդուկտի վերլուծական տվյալների մշակում:',
    },
  },
];

export const getTags = (): TagType[] => {
  return tags;
};
