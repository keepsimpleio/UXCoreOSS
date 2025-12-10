import { FC, useState, MouseEvent, useEffect } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router';

import type { TRouter } from '@local-types/global';
import modalIntl from '@data/modalRaiting';
import { updateVH, saveInLocalStorage, getRatedItems } from '@lib/helpers';
import { rateRequest } from '@api/rating';
import useSpinner from '@hooks/useSpinner';

import styles from './ModalRaiting.module.scss';

const rangeItems = Array(10)
  .fill(null)
  .map((_, i) => i + 1);

type ModalRaitingProps = {
  id: number;
  type: 'bias' | 'question';
};

const ModalRaiting: FC<ModalRaitingProps> = ({ id, type }) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const { setIsVisible } = useSpinner()[0];
  const [hoveredRangeItemId, setHoveredRangeItemId] = useState(null);
  const [isRateVisibile, setIsRateVisibile] = useState(true);

  const handleRangeItemMouseOver = (e: MouseEvent<HTMLDivElement>) => {
    const { raiting } = e.currentTarget.dataset;
    setHoveredRangeItemId(Number(raiting));
  };

  const handleRangeItemMouseOut = () => {
    setHoveredRangeItemId(null);
  };

  const handleRate = async (e: MouseEvent<HTMLDivElement>) => {
    const { raiting } = e.currentTarget.dataset;
    setIsVisible(true);

    try {
      await rateRequest(id, Number(raiting), type);
      saveInLocalStorage(id, type);
    } catch (err) {
      console.error('Error while rating:', err);
    }

    setIsVisible(false);
    setIsRateVisibile(false);
  };

  useEffect(() => {
    const ratedItems = getRatedItems(type);
    setIsRateVisibile(!ratedItems.includes(id));
  }, [id, type]);

  useEffect(() => {
    updateVH();
    window.addEventListener('resize', updateVH);

    return () => {
      window.removeEventListener('resize', updateVH);
    };
  }, []);

  const { howUseful, notUseful, veryUseful, thanks } = modalIntl[locale];

  return (
    <div className={styles.ModalRaiting}>
      <div
        className={cn(styles.Rating, {
          [styles.Hidden]: !isRateVisibile,
        })}
      >
        <div className={styles.Question}>{howUseful}</div>
        <div className={styles.Table}>
          <div className={styles.Label}>{notUseful}</div>
          <div className={styles.Range}>
            {rangeItems.map(i => (
              <div
                key={i}
                data-raiting={i}
                className={cn(styles.RangeItem, {
                  [styles.Hovered]: hoveredRangeItemId >= i,
                })}
                onMouseOver={handleRangeItemMouseOver}
                onMouseOut={handleRangeItemMouseOut}
                onClick={handleRate}
              >
                <div className={styles.Block}></div>
                <div className={styles.Number}>{i}</div>
              </div>
            ))}
          </div>
          <div className={cn(styles.Label, styles.Mobile)}>{notUseful}</div>
          <div className={styles.Label}>{veryUseful}</div>
        </div>
      </div>
      <div
        className={cn(styles.ThankYou, {
          [styles.Hidden]: isRateVisibile,
        })}
      >
        {thanks}
      </div>
    </div>
  );
};

export default ModalRaiting;
