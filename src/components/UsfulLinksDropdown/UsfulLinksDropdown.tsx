import { FC, useCallback, useState } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import toolHeaderData from '@data/toolHeader';

import type { TRouter } from '@local-types/global';
import type { TagType } from '@local-types/data';

const UsefulLinksContent = dynamic(() => import('../UsefulLinksContent'), {
  ssr: false,
});

import DiamondIcon from '@icons/DiamondIcon';
import CaretDownIcon from '@icons/CaretDownIcon';

import styles from './UsfulLinksDropdown.module.scss';

type UsfulLinksDropdownProps = {
  page: 'uxcp' | 'uxcg' | 'uxcore' | 'uxeducation' | 'uxcat';
  tags: TagType[];
};

const UsfulLinksDropdown: FC<UsfulLinksDropdownProps> = ({ tags, page }) => {
  const router = useRouter();
  const [isOpened, setIsOpened] = useState(false);
  const { locale } = router as TRouter;
  const { usefulLinksLabel } = toolHeaderData[locale];

  const toggleDropdown = useCallback(() => {
    setIsOpened(prevState => !prevState);
  }, []);

  return (
    <div
      className={cn(styles.UsefulLinksDropdown, {
        [styles.Opened]: isOpened,
      })}
      onClick={toggleDropdown}
      data-cy={'useful-links-dropdown'}
    >
      <div className={styles.Title}>
        <DiamondIcon />
        <span>{usefulLinksLabel}</span>
        <CaretDownIcon />
      </div>
      <UsefulLinksContent tags={tags} page={page} />
    </div>
  );
};

export default UsfulLinksDropdown;
