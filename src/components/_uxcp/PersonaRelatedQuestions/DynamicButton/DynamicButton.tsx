import { FC } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router';

import type { TRouter } from '@local-types/global';
import type { TagType } from '@local-types/data';
import uxcpLocalization from '@data/uxcp';

import styles from './DynamicButton.module.scss';

type DynamicButtonProps = {
  stageIndex: number;
  tags: TagType[];
};

const DynamicButton: FC<DynamicButtonProps> = ({ stageIndex, tags }) => {
  const { locale } = useRouter() as TRouter;
  const isEng = locale === 'en';
  const { stage } = uxcpLocalization[locale];

  if (stageIndex === null) return null;

  return (
    <div
      className={cn(styles.DynamicButton, {
        [styles[`Active${stageIndex}`]]: true,
        [styles.Ru]: !isEng,
        [styles.Hy]: locale === 'hy',
      })}
    >
      <div className={styles.Titles}>
        {tags.map(({ id, title }) => (
          <div key={id} className={styles.Title}>
            {isEng ? `${title['en']} ${stage}` : title[locale]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicButton;
