import { FC } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import Switcher from '@components/_uxcp/Switcher';
import Tooltip from '@components/Tooltip';

import type { TRouter } from '@local-types/global';

import uxcpLocalization from '@data/uxcp';

import styles from './TeamMemberSwitcher.module.scss';

type TTeamMemberSwitcher = {
  isActive: boolean;
  onChange: (v: boolean) => void;
};

const TeamMemberSwitcher: FC<TTeamMemberSwitcher> = ({
  isActive,
  onChange,
}) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const { analyzeTeamMemeber, analyzeTeamMemeberTooltip } =
    uxcpLocalization[locale];

  return (
    <div className={styles.TeamMemberSwitcher}>
      <div className={styles.QuestionContainer}>
        <span className={styles.Question}>{analyzeTeamMemeber}</span>
        <span className={styles.QuestionMarkContainer}>
          <Tooltip content={analyzeTeamMemeberTooltip}>
            <Image
              src="/assets/icons/q-mark.svg"
              width="13"
              height="13"
              alt="question-mark"
            />
          </Tooltip>
        </span>
      </div>
      <div className={styles.SwitcherContainer}>
        <Switcher isActive={isActive} onChange={onChange} />
      </div>
    </div>
  );
};

export default TeamMemberSwitcher;
