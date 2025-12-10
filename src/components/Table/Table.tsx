import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';

import Tag, { TTag } from '@components/Tag';
import Button from '@components/Button';
import type { QuestionType, TagType } from '@local-types/data';
import { TRouter } from '@local-types/global';
import tableIntl from '@data/table';

import Search from './TableSearch';
import styles from './Table.module.scss';
import Link from 'next/link';

type TableProps = {
  data: QuestionType[];
  tags: TagType[];
  activeFilter: string;
  withSearch?: boolean;
  disableTooltips?: boolean;
  maxHeight?: string | number;
  noResults?: boolean;
  focusSearchOnInit?: boolean;
  biasNumber?: number;
  onFilterClick?: (id: string) => void;
  onSearch?: (value: string) => void;
  onSearchClear?: () => void;
  showMoreButton?: boolean;
  searchValue?: string;
  setSearchValue?: (value: string) => void;
  setIsQuestionHovered?: (value: boolean) => void;
  isUXCoreModal?: boolean;
};

const Table: FC<TableProps> = ({
  data: incomingData,
  tags,
  activeFilter,
  withSearch,
  maxHeight,
  disableTooltips = true,
  noResults,
  focusSearchOnInit,
  onFilterClick,
  onSearch,
  onSearchClear,
  biasNumber,
  showMoreButton,
  searchValue,
  isUXCoreModal,
  setSearchValue,
  setIsQuestionHovered,
}) => {
  const [data, setData] = useState(incomingData);
  const [displayedItems, setDisplayedItems] = useState(data.length);
  const [isActive, setIsActive] = useState(false);

  const formatName = (number, title) => {
    return `#${number}. ${title}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive(true);

      setTimeout(() => {
        setIsActive(false);
      }, 1600);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const router = useRouter();
  const { locale } = router as TRouter;
  const tableBodyRef = useRef(null);
  const labelEn = 'Select your product stage';
  const labelRu = 'Выберите стадию вашего проекта';
  const labelHy = 'Ընտրեք ձեր պրոդուկտի փուլը';

  const labelLocales = {
    en: labelEn,
    ru: labelRu,
    hy: labelHy,
  };
  const label = labelLocales[locale];

  const sortData = useCallback(dataToSort => {
    const newData = [...dataToSort];
    newData.sort((a: any, b: any) => {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });

    return newData;
  }, []);

  const showMoreTxts = {
    en: 'Show more',
    ru: 'Показать больше',
    hy: 'Ցույց տալ ավելին',
  };
  const showLessTxts = {
    en: 'Show less',
    ru: 'Показать меньше',
    hy: 'Ցույց տալ պակաս',
  };
  const showMoreText = showMoreTxts[locale];
  const showLessText = showLessTxts[locale];

  const handleChange = useCallback(
    (value: string) => {
      onSearch && onSearch(value);
      setSearchValue(value);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    onSearchClear && onSearchClear();
  }, [onSearchClear]);

  const handleTagFilterClick = useCallback(
    e => {
      const { id } = e.target.dataset;
      onFilterClick(id);
    },
    [onFilterClick],
  );

  const findAnswerIndexByBiasNumber = useCallback(
    (biasNumber: number, questionIndex: number) => {
      // HYTranslation TODO
      const answers = data[questionIndex]?.attributes?.answers.split('\n');
      return answers.findIndex((item: string) => {
        return item.includes(`{{${biasNumber}}}`);
      });
    },
    [locale, data],
  );

  const openQuestion = useCallback(
    (number: number, biasNumber: number, answerIndex: number) => {
      const basePath =
        router.locale === 'ru'
          ? '/ru/uxcg'
          : router.locale === 'hy'
            ? '/hy/uxcg'
            : '/uxcg';
      router.push(
        `${basePath}/${number}${biasNumber ? `#${answerIndex}` : ''}`,
        undefined,
        { scroll: false },
      );
    },
    [biasNumber, router],
  );

  useEffect(() => {
    const newData = sortData(incomingData);
    setData(newData);
  }, [incomingData, sortData]);

  useEffect(() => {
    if (data.length) {
      setDisplayedItems(data.length);
    }
    if (showMoreButton) {
      setDisplayedItems(3);
    }
  }, [showMoreButton, data.length]);

  const { allQuestionsButtonLabel } = tableIntl[locale];
  return (
    <>
      {withSearch && (
        <div className={styles.TableSearchWrapper}>
          <Search
            onChange={handleChange}
            onClear={handleClear}
            focusOnInit={!!focusSearchOnInit}
          />
        </div>
      )}
      <div
        className={cn(styles.Table, {
          [styles.SearchLess]: !withSearch,
          [styles.UXCoreModal]: isUXCoreModal,
        })}
      >
        {withSearch && (
          <div
            className={cn(styles.TableFilterWrapper, {
              [styles.Collapsed]: !!searchValue,
            })}
          >
            <div
              className={cn(styles.LabelWrapper, {
                [styles.LabelWrapperAnimation]: isActive,
              })}
            >
              <span className={styles.SelectionTxt}> {label} </span>
            </div>
            <Tag
              dataId="all"
              styles={{ backgroundColor: '#617181' }}
              isActive={activeFilter === 'all'}
              title={allQuestionsButtonLabel}
              type="button"
              onClick={handleTagFilterClick}
              large
              className={styles.AllQuestionsButton}
            />
            {tags.map((tag, index) => (
              <Tag
                dataId={String(tag.id)}
                key={index}
                {...tag}
                large
                onClick={handleTagFilterClick}
                type="button"
                isActive={activeFilter === String(tag.id)}
                className={styles.TableFilter}
              />
            ))}
          </div>
        )}
        <div
          className={styles.TableBody}
          ref={tableBodyRef}
          style={{ maxHeight }}
        >
          {noResults && (
            <div className={styles.NoResults} data-cy={'No Results Found'}>
              No results found
            </div>
          )}
          {/*HYTranslation TODO*/}
          {data.slice(0, displayedItems).map(({ attributes }, index) => {
            const { slug } = attributes;
            const itemTags = JSON.parse(attributes?.tags || '[]');
            const answerIndex = findAnswerIndexByBiasNumber(biasNumber, index);
            const name = formatName(attributes.number, attributes.title);

            const isHidden =
              activeFilter !== 'all' &&
              !itemTags.includes(Number(activeFilter));

            return (
              <div
                // style={{ display: isHidden ? 'none' : 'block' }}
                data-cy="open-question"
                key={index}
                className={cn(styles.TableRow, {
                  [styles.Hidden]: isHidden,
                })}
                onClick={() => {
                  openQuestion(slug, biasNumber, answerIndex);
                }}
                onMouseEnter={() => {
                  setIsQuestionHovered && setIsQuestionHovered(true);
                }}
                onMouseLeave={() => {
                  setIsQuestionHovered && setIsQuestionHovered(false);
                }}
              >
                <div className={styles.TableRowTags}>
                  {itemTags.map((tagId, tagIndex) => {
                    if (
                      activeFilter !== 'all' &&
                      tagId !== Number(activeFilter)
                    )
                      return null;
                    const tagData = tags.find((tag: TTag) => tag.id === tagId);

                    if (tagData) {
                      return (
                        <Tag
                          key={tagIndex}
                          {...tagData}
                          tooltip={disableTooltips ? null : tagData.tooltip}
                          className={styles.TableRowTag}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
                <div className={styles.TableRowData}>
                  <Link
                    href={`/uxcg/${slug}`}
                    key={index}
                    scroll={false}
                    className={styles.questionTitle}
                  >
                    {name}
                  </Link>
                </div>
              </div>
            );
          })}

          {showMoreButton && (
            <div className={styles.showMoreLessBtns}>
              {data.length > displayedItems && (
                <Button
                  label={showMoreText}
                  type={'primary'}
                  onClick={() =>
                    setDisplayedItems(displayedItems + data.length)
                  }
                  className={cn({
                    [styles.showMoreBtn]: isUXCoreModal,
                  })}
                  dataCy="show-more-button"
                />
              )}
              {displayedItems > 3 && (
                <Button
                  label={showLessText}
                  onClick={() => setDisplayedItems(3)}
                  className={cn({
                    [styles.showLessBtn]: isUXCoreModal,
                  })}
                  dataCy="show-less-button"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(Table);
