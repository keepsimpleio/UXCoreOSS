import type { FC } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import type { TRouter } from '@local-types/global';

import uxcpLocalization from '@data/uxcp';

import styles from './MobileDisclimer.module.scss';

const MobileDisclimer: FC = () => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const { mobileDisclimer } = uxcpLocalization[locale];

  return (
    <div className={styles.MobileDisclimer}>
      <Image
        src="/assets/icons/mobile-disclimer.svg"
        alt="mobile disclimer for mobile version"
        width={24}
        height={22}
      />
      <div>{mobileDisclimer}</div>
    </div>
  );
};

export default MobileDisclimer;
