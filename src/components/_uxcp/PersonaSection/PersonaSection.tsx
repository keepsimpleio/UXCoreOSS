import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';

import TeamMemberSwitcher from '@components/_uxcp/TeamMemberSwitcher';
import Input from '@components/Input';

import type { TRouter } from '@local-types/global';

import uxcpLocalization from '@data/uxcp';
import useMobile from '@hooks/useMobile';

import styles from './PersonaSection.module.scss';

type TPersonaSection = {
  inputValue: string;
  onInputChange: (name: string) => void;
  isActive: boolean;
  onSwitchChange: (value: boolean) => void;
};

const PersonaSection: FC<TPersonaSection> = ({
  inputValue,
  onInputChange,
  isActive,
  onSwitchChange,
}) => {
  const router = useRouter();
  const { isMobile } = useMobile()[1];
  const { locale } = router as TRouter;
  const {
    personaInputLabel,
    personaInputPlaceholder,
    personaInputMobilePlaceholder,
  } = uxcpLocalization[locale];

  const placeholder = useMemo(
    () => (isMobile ? personaInputMobilePlaceholder : personaInputPlaceholder),
    [isMobile],
  );

  return (
    <div className={styles.PersonaSection}>
      <div className={styles.Wrapper}>
        <Input
          controlled
          value={inputValue}
          label={personaInputLabel}
          placeholder={placeholder}
          marginBottom={10}
          charLimit={20}
          onChange={onInputChange}
        />
        <TeamMemberSwitcher isActive={isActive} onChange={onSwitchChange} />
      </div>
    </div>
  );
};

export default PersonaSection;
