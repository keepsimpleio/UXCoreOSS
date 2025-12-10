export type TLocales = 'en' | 'ru' | 'hy';

export type TStaticProps = { params: any; locale: TLocales };

export type TNavbarSubmenuItems = {
  label?: string;
  prefix?: string;
  title?: string;
  href?: string;
  target?: '_blank' | '_self';
  icon?: string;
  answers?: {
    description: string;
    items?: string[];
  };
};
export type TNavbarManagementTools = {
  title: string;
  href?: string;
  submenuItems?: TNavbarSubmenuItems[];
};

export type TNavbarDataItem = {
  title: string;
  href?: string;
  target?: string;
  icon?: string;
  submenuItems?: TNavbarSubmenuItems[];
  tools?: TNavbarManagementTools[];
};

export interface TitlesType {
  en: string;
  ru: string;
  hy: string;
}

export interface QuestionType {
  attributes: any; //HYTranslation TODO
  title: any;
  titleEn: string;
  titleRu: string;
  titleHy: string;
  number: number | null;
  answersEn: string;
  answersRu: string;
  answersHy: string;
  tags: number[];
  downloadLinks?: {
    en?: string;
    ru?: string;
  };
  aliases: string[];
  relatedQuestions: number[];
  _id?: string;
  __v?: number;
  seoTitleEn: string;
  seoTitleRu: string;
  seoTitleHy: string;
  keywordsEn: string;
  keywordsRu: string;
  keywordsHy: string;
  seoDescriptionEn: string;
  seoDescriptionRu: string;
  seoDescriptionHy: string;
  pageTitleEn: string;
  pageTitleRu: string;
  pageTitleHy: string;
  slugEn: string;
  slugRu: string;
  slugHy: string;
  slug?: string;
  updatedAt?: string;
}

export interface TagType {
  id: number;
  styles: {
    backgroundColor: string;
  };

  tooltip: TitlesType;
  title: TitlesType;
}

export interface BiasType {
  mentionedQuestionsIds: string[];
  p: boolean;
  m: boolean;
  titleEn: string;
  descrEn: string;
  usageEn: string;
  wikiLink: string;
  titleRu: string;
  descrRu: string;
  usageRu: string;
  createdAt: string;
  updatedAt: string;
  number: number;
  _id?: string;
  __v?: number;
  attributes?: any; // HYTranslation TODO
}

export interface StrapiBiasType {
  titleEn: string;
  titleRu: string;
  titleHy: string;
  title?: string;

  OGTagsEn: any;
  OGTagsRu: any;
  OGTagsHy: any;

  descrEn: string;
  descrRu: string;
  descrHy: string;

  usageEn: string;
  usageRu: string;
  usageHy: string;

  usageHrEn: string;
  usageHrRu: string;
  usageHrHy: string;

  usageUiUxEn: string;
  usageUiUxRu: string;
  usageUiUxHy: string;

  number: number;
  _id?: number;

  mentionedQuestionsIds: string;

  wikiLinkEn: string;
  wikiLinkRu: string;
  wikiLinkHy: string;

  m: boolean;
  p: boolean;

  seoTitleEn: string;
  seoTitleRu: string;
  seoTitleHy: string;

  pageTitleEn: string;
  pageTitleRu: string;
  pageTitleHy: string;

  keywordsEn: string;
  keywordsRu: string;
  keywordsHy: string;

  seoDescriptionEn: string;
  seoDescriptionRu: string;
  seoDescriptionHy: string;
  [key: string]: string | number | boolean;

  attributes?: any; // HYTranslation TODO
}

export type RelevantQuestionType = QuestionType & {
  relevantFor: StrapiBiasType[];
  relevancy: number;
  relevancyIndex: number;
  relevancyTitle: 'high' | 'medium' | 'low';
  percentOfAppearing: number;
};

export type SuggestedQuestionType = QuestionType & {
  relevancy: number;
  relevancyIndex: number;
  relevancyTitle: 'high' | 'medium' | 'low';
  percentOfAppearing: number;
};

export type TArticle = {
  id: number;
  headline?: string;
  OGTags: {
    ogDescription: string;
    ogTitle: string;
    ogType: string;
    ogImageAlt?: string;
    ogImage?: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
  attributes: {
    content: string;
    createdAt: string;
    description: string;
    locale: string;
    publishedAt: string;
    sequence_number: number;
    title: string;
    updatedAt: string;
    url: string;
    newUrl: string;
    category: any;
    seoDescription?: string;
    seoTitle?: string;
    keywords?: string;
    pageTitle?: string;
  };

  seoDescription?: string;
  seoTitle?: string;
  keywords?: string;
  pageTitle?: string;
  profile_image: any;
};

export type THomePage = {
  content?: string;
  createdAt: string;
  headline: string;
  locale: string;
  localizations: any;
  profile_image?: any;
  publishedAt: string;
  updatedAt: string;
  seoDescription?: string;
  seoTitle?: string;
  keywords?: string;
  pageTitle?: string;
};

export type TPaths = {
  params: { page: string };
  locale: string;
};
