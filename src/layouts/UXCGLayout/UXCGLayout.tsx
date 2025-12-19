import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import ToolFooter from '@components/ToolFooter';
import Table from '@components/Table';
import UXCGDescription from '@components/UXCGDescription';

import type { QuestionType, TagType } from '@local-types/data';
import { TRouter } from '@local-types/global';

import useSpinner from '@hooks/useSpinner';

import styles from './UXCGLayout.module.scss';
import uxcgDescriptionData from '@data/uxcgDescriptionData';
import cn from 'classnames';

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
  const [isAciveSearch, setIsActiveSearch] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<QuestionType[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('1');

  const searchDebounce: any = useRef();

  const router = useRouter();
  const { locale } = router as TRouter;

  const initialSearchValue = router.query.search as string;

  const { subTitle } = uxcgDescriptionData[locale];

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
        {changedHeadingOrder ? (
          <h4 className={styles.ShortName} aria-hidden={changedHeadingOrder}>
            {subTitle}
          </h4>
        ) : (
          <h2 className={styles.ShortName} aria-hidden={changedHeadingOrder}>
            {subTitle}
          </h2>
        )}
        <section
          className={cn(styles.ShiftedContent, {
            [styles.hyLayout]: locale === 'hy',
          })}
        >
          <UXCGDescription tags={tags} />
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
          />
        </section>
        <div className={styles.Motto}>Be Kind. Do Good.</div>
      </div>
      <ToolFooter page="uxcg" />
    </div>
  );
};

export default UXCGLayout;
