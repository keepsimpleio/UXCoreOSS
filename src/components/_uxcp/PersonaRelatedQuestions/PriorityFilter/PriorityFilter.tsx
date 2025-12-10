import { FC, useCallback } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router';
import Image from 'next/image';

import type { TRouter } from '@local-types/global';
import uxcpLocalization from '@data/uxcp';

import Tooltip from '@components/Tooltip';

import styles from './PriorityFilter.module.scss';

type PriorityFilterProps = {
  selectedPriority: 'all' | 'high' | 'medium' | 'low';
  onChange: (newSelectedPriority: 'all' | 'high' | 'medium' | 'low') => void;
};

const PriorityFilter: FC<PriorityFilterProps> = ({
  selectedPriority,
  onChange,
}) => {
  const { locale } = useRouter() as TRouter;
  const {
    relevancyLevel,
    relevancyLevelHint,
    all,
    highPriority,
    mediumPriority,
    lowPriority,
  } = uxcpLocalization[locale];

  const handleFilterChange = useCallback(e => {
    const { id } = e.currentTarget.dataset;

    onChange(id);
  }, []);

  return (
    <div
      className={cn(styles.PriorityFilter, {
        [styles.PriorityFilterHy]: locale === 'hy',
      })}
    >
      <div className={styles.TitleContainer}>
        <span className={styles.Title}>{relevancyLevel}</span>
        <span className={styles.TitleMarkContainer}>
          <Tooltip content={relevancyLevelHint}>
            <Image
              src="/assets/icons/q-mark.svg"
              width={13}
              height={17}
              alt={'question-mark'}
            />
          </Tooltip>
        </span>
      </div>
      <div
        className={cn(styles.Buttons, {
          [styles[`Active-${selectedPriority}`]]: true,
        })}
      >
        <div
          className={styles.Button}
          data-id="all"
          onClick={handleFilterChange}
        >
          {all}
        </div>
        <div
          className={styles.Button}
          data-id="high"
          onClick={handleFilterChange}
        >
          <Image
            src="/assets/icons/priority-high.svg"
            alt="priority level"
            width={10}
            height={12}
          />
          {highPriority}
        </div>
        <div
          className={styles.Button}
          data-id="medium"
          onClick={handleFilterChange}
        >
          <Image
            src="/assets/icons/priority-medium.svg"
            alt="priority level"
            width={10}
            height={9}
          />
          {mediumPriority}
        </div>
        <div
          className={styles.Button}
          data-id="low"
          onClick={handleFilterChange}
        >
          <Image
            src="/assets/icons/priority-low.svg"
            alt="priority level"
            width={10}
            height={6}
          />
          {lowPriority}
        </div>
      </div>
    </div>
  );
};

export default PriorityFilter;
