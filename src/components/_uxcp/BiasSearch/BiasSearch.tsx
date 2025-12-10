import { FC, SetStateAction, useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import cn from 'classnames';
import { useRouter } from 'next/router';

import Input from '@components/Input';
import Tooltip from '@components/Tooltip';
import BiasActionCell from '@components/_uxcp/BiasActionCell';
import Section from '@components/Section';

import type { TRouter } from '@local-types/global';
import type { StrapiBiasType } from '@local-types/data';

import uxcpLocalization from '@data/uxcp';

import { getSearchResultsUxcp } from '@lib/helpers';

import styles from './BiasSearch.module.scss';

const searchPostfixes = {
  en: [
    ['', 's'],
    ['', ''],
    ['', 's'],
  ],
  ru: [
    ['о', 'ов'],
    ['', ''],
    ['о', 'а'],
  ],
  hy: [
    ['', 'եր'],
    ['', ''],
    ['', ''],
  ],
};

const getPostFix = (length: number, locale: 'en' | 'ru' | 'hy') => {
  const mainNumber = length % 100;
  const lastNumber = mainNumber % 10;
  if (mainNumber >= 10 && mainNumber < 20) {
    return searchPostfixes[locale][0];
  } else {
    if (lastNumber == 1) return searchPostfixes[locale][1];
    else if (lastNumber > 1 && lastNumber < 5)
      return searchPostfixes[locale][2];
    else return searchPostfixes[locale][0];
  }
};

type TBiasSearch = {
  biases: StrapiBiasType[];
  selectedBiases: StrapiBiasType[];
  onChange: (action: SetStateAction<StrapiBiasType[]>) => void;
  setRemovableBiasId?: (removableBiasId: number) => void;
};

const BiasSearch: FC<TBiasSearch> = ({
  biases,
  selectedBiases,
  onChange,
  setRemovableBiasId,
}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [isCollaped, setIsCollaped] = useState<boolean>(true);

  const router = useRouter();
  const { locale } = router as TRouter;
  const {
    biasSearchPlaceholder,
    biasSearchTip,
    showAllText,
    sectionTitle,
    searchResultText1,
    searchResultText2,
  } = uxcpLocalization[locale];

  const handleInputSearch = useCallback(
    (v: string) => {
      const { results } = getSearchResultsUxcp(
        biases,
        v.toLocaleLowerCase(),
        locale,
      );
      setSearchResults(results);
      setSearchValue(v);
    },
    [locale],
  );

  const handleCollapseClick = useCallback(() => {
    setIsCollaped(prevState => !prevState);
  }, []);

  const handleClearSearch = useCallback(() => {
    if (!!searchValue) {
      setSearchValue('');
    }
  }, [searchValue]);

  const filteredBiases = useMemo(() => {
    if (isCollaped && !searchValue) {
      return biases.slice(0, 10);
    }

    if (!!searchValue)
      return biases.filter(bias => searchResults.includes(bias.number));

    return biases;
  }, [isCollaped, biases, searchValue, searchResults]);

  const { showSearchResultsMessage, searchResultsMessage } = useMemo(() => {
    const resultsAmount = filteredBiases.length;

    const postfixes = getPostFix(resultsAmount, locale);

    const showSearchResultsMessage = !!searchValue;

    const searchResultsMessage = (
      <span>
        {searchResultText1}
        {postfixes[0]} <b>{resultsAmount}</b> {searchResultText2}
        {postfixes[1]}
      </span>
    );

    return { showSearchResultsMessage, searchResultsMessage };
  }, [locale, filteredBiases, searchValue]);

  return (
    <Section>
      <div className={styles.SectionTitle}>{sectionTitle}</div>
      <div className={styles.BiasSearch}>
        <div className={styles.SearchContainer}>
          <Input
            placeholder={biasSearchPlaceholder}
            onChange={handleInputSearch}
            marginBottom={0}
            searchIcon={!searchValue}
            clearIcon={!!searchValue}
            onIconClick={handleClearSearch}
            errorMessage={searchResultsMessage}
            messageType="tip"
            validationFunction={s => true}
            showMessage={showSearchResultsMessage}
          />
          <div className={styles.SearchTipContainer}>
            <Tooltip content={biasSearchTip} isHy={locale === 'hy'}>
              <Image
                src="/assets/icons/q-mark.svg"
                width={13}
                height={13}
                alt={'question mark'}
              />
            </Tooltip>
          </div>
        </div>
        <div
          className={cn(styles.Table, {
            [styles.Expanded]: !isCollaped || !!searchValue,
          })}
        >
          {filteredBiases.map(bias => (
            <BiasActionCell
              key={bias.number}
              bias={bias}
              isSelected={
                !!selectedBiases.find(({ number }) => number === bias.number)
              }
              onChange={onChange}
              setRemovableBiasId={setRemovableBiasId}
            />
          ))}
        </div>
        <div
          className={cn(styles.ShowAllButtonContainer, {
            [styles.Hidden]: !isCollaped || !!searchValue,
          })}
        >
          <div
            className={styles.ShowAllButton}
            onClick={handleCollapseClick}
            data-cy={'show-all-button'}
          >
            {showAllText}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default BiasSearch;
