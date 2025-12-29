import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';

import ToolFooter from '@components/ToolFooter';
import Table from '@components/Table';
import PanelHeader from '@components/uxcg/PanelHeader';
import TagContainer from '@components/uxcg/TagContainer';

import { QuestionType, TagType } from '@local-types/data';
import { TRouter } from '@local-types/global';

import uxcgDescriptionData from '@data/uxcgDescriptionData';

import useSpinner from '@hooks/useSpinner';

import styles from './UXCGLayout.module.scss';

interface UXCGLayoutProps {
  questions: any;
  tags: TagType[];
  changedHeadingOrder?: boolean;
  searchValue?: string;
  setSearchValue?: (value: string) => void;
  allQuestions: any;
}

const UXCGLayout: FC<UXCGLayoutProps> = ({
  questions,
  tags,
  changedHeadingOrder = false,
  searchValue,
  setSearchValue,
  allQuestions,
}) => {
  const { setIsVisible } = useSpinner()[0];
  const searchDebounce: any = useRef();
  const router = useRouter();
  const { locale } = router as TRouter;
  const { description, defaultStage, selectStageTxt, relevantQuestionsTxt } =
    uxcgDescriptionData[locale];

  const [isAciveSearch, setIsActiveSearch] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<QuestionType[]>([]);
  const [stageName, setStageName] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('1');
  const stageText = stageName[locale] || defaultStage;

  const relevantQuestionsWithStage = {
    en: `Relevant questions for your project's ${stageText} stage`,
    ru: `Актуальные вопросы для этапа "${stageText}" вашего проекта`,
    hy: `Համապատասխան հարցեր ձեր նախագծի ${stageText} փուլում`,
  };
  const prevFilterRef = useRef(activeFilter);

  const initialSearchValue = router.query.search as string;

  const filterQuestionsBySearchTerm = (
    searchTerm: string,
    allQuestions: {
      en: QuestionType[];
      ru: QuestionType[];
      hy: QuestionType[];
    },
    currentLocale: 'en' | 'ru' | 'hy',
  ): QuestionType[] => {
    const foundNumbers = new Set<number>();
    const normalizedTerm = searchTerm.toLowerCase();

    for (const locale of ['en', 'ru', 'hy'] as const) {
      for (const question of allQuestions[locale]) {
        const raw = question.attributes?.aliases;
        const aliases = Array.isArray(raw) ? raw : [raw];

        const matched = aliases.some(alias =>
          alias?.toLowerCase().includes(normalizedTerm),
        );

        if (matched) {
          foundNumbers.add(question.attributes.number);
        }
      }
    }

    return allQuestions[currentLocale].filter(q =>
      foundNumbers.has(q.attributes.number),
    );
  };

  const handleSearch = useCallback(
    (value: string) => {
      clearTimeout(searchDebounce.current);

      if (!!value.trim()) {
        searchDebounce.current = setTimeout(() => {
          try {
            setIsVisible(true);
            setIsActiveSearch(true);
            const newSearchResults: QuestionType[] =
              filterQuestionsBySearchTerm(value, allQuestions, locale);
            setSearchResults(newSearchResults);
            setIsVisible(false);
            router.push(`/uxcg?search=${value}`, undefined, {
              scroll: false,
              shallow: true,
            });
          } catch (err) {
            setIsVisible(false);
            setIsActiveSearch(false);
            setSearchResults([]);
          }
        }, 250);
      } else {
        setIsVisible(false);
        setIsActiveSearch(false);
        setSearchResults([]);
      }
      if (value.length === 0) {
        router.push(`/uxcg`, undefined, {
          scroll: true,
          shallow: true,
        });
      }
    },
    [setIsVisible, questions],
  );

  const searchResultTags = searchResults.map(
    question => question.attributes.tags,
  );
  const resultTags = searchResultTags.flatMap(item =>
    JSON.parse(item).map(String),
  );

  useEffect(() => {
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handlePopState = () => {
    setSearchValue(initialSearchValue);
  };

  useEffect(() => {
    setSearchValue(initialSearchValue);
    if (initialSearchValue) {
      const newSearchResults = filterQuestionsBySearchTerm(
        initialSearchValue,
        allQuestions,
        locale,
      );
      setSearchResults(newSearchResults);
      setSearchValue(initialSearchValue as string);
    }
    return () => {
      clearTimeout(searchDebounce.current);
    };
  }, [initialSearchValue, router.asPath, locale]);

  useEffect(() => {
    if (isAciveSearch) {
      prevFilterRef.current = activeFilter;
      setActiveFilter('');
    } else {
      setActiveFilter(prevFilterRef.current);
    }
  }, [isAciveSearch]);

  return (
    <div className={styles.body}>
      <div
        className={cn(styles.Content, {
          [styles.hyLayout]: locale === 'hy',
        })}
      >
        {changedHeadingOrder ? (
          <h3 className={styles.Title}>UX CORE GUIDE</h3>
        ) : (
          <h1 className={styles.Title}>UX CORE GUIDE</h1>
        )}
        <p className={styles.description}> {description}</p>
        <section
          className={cn(styles.ShiftedContent, {
            [styles.hyLayout]: locale === 'hy',
          })}
        >
          <PanelHeader
            icon={'/assets/uxcg/roadmap.png'}
            text={selectStageTxt}
          />
          <div className={styles.tagContainerWrapper}>
            {tags.map((tag, index) => (
              <TagContainer
                // @ts-ignore
                setStageName={setStageName}
                resultTags={resultTags}
                id={tag.id}
                iconUrl={tag.iconUrl}
                key={index}
                {...tag}
                backgroundUrl={tag.backgroundUrl}
                iconName={tag.iconName}
                activeFilter={activeFilter}
                isSelected={
                  activeFilter === String(tag.id) || activeFilter === 'all'
                }
                title={tag.title}
                locale={locale}
                onClick={setActiveFilter}
              />
            ))}
          </div>
          <PanelHeader
            className={styles.relevantQuestionsHeader}
            icon={'/assets/uxcg/question.png'}
            text={
              stageName !== 'all'
                ? relevantQuestionsWithStage[locale]
                : relevantQuestionsTxt
            }
          />
          <Table
            showMoreButton={false}
            data={
              initialSearchValue || isAciveSearch ? searchResults : questions
            }
            tags={tags}
            activeFilter={isAciveSearch ? 'all' : activeFilter}
            onSearch={handleSearch}
            noResults={isAciveSearch && !searchResults.length}
            onFilterClick={setActiveFilter}
            withSearch
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            setStageName={setStageName}
          />
        </section>
        <div className={styles.Motto}>Be Kind. Do Good.</div>
      </div>
      <ToolFooter page="uxcg" />
    </div>
  );
};

export default UXCGLayout;
